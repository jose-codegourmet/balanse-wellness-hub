"use client";

import {
  type ApiFetcher,
  activate as activatePaymentAccount,
  archive as archivePaymentAccount,
  confirmAccountImage,
  createFaq,
  createPaymentAccount,
  createPolicyDocument,
  createPolicyVersion,
  deleteFaq,
  deletePolicyDocument as deletePolicyDocumentRequest,
  mintAccountImage,
  type PaymentAccountInput,
  patchAdminSettings,
  patchFaq,
  patchPaymentAccount,
  promotePolicyVersion,
  putPolicyFormRequirements,
  putSignedUpload,
  reorderFaqs,
} from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import type { AdminSettings, PolicyFormRequirements } from "@balanse/domain";
import { type QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AdminAuthScope } from "../auth-scope";
import { adminKeys } from "../keys";
import { invalidateForRole, useAdminAuthScope } from "./shared";

function paymentQrKeys(role: AdminAuthScope): QueryKey[] {
  return [adminKeys.paymentQrs.all(role), adminKeys.settings.all(role)];
}

type UpsertPaymentAccountInput = Partial<PaymentAccountInput> & { id?: string };

/** `fetcher` defaults to the real browser client; stories pass a mock fetcher. */
export function useUpsertPaymentQr(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: UpsertPaymentAccountInput) =>
      id
        ? patchPaymentAccount(fetcher, id, input).then((res) => res.qr)
        : createPaymentAccount(fetcher, input as PaymentAccountInput).then((res) => res.qr),
    onSuccess: () => invalidateForRole(queryClient, paymentQrKeys(role)),
  });
}

export function useSetPaymentQrActive(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; active: boolean }) =>
      activatePaymentAccount(fetcher, input.id, input.active),
    onSuccess: () => invalidateForRole(queryClient, paymentQrKeys(role)),
  });
}

export function useArchivePaymentQr(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => archivePaymentAccount(fetcher, id),
    onSuccess: () => invalidateForRole(queryClient, paymentQrKeys(role)),
  });
}

/**
 * Mint → PUT → confirm as one mutation (WIRE-1705, #371) — the form doesn't
 * have an account id yet when adding a new one, so this never ties the
 * upload to an entity; it just returns the confirmed `objectKey` for the
 * form's `imageKey` field. The create/patch call saves it to the account.
 */
export function useUploadPaymentAccountImage(fetcher: ApiFetcher = apiFetchBrowser) {
  return useMutation({
    mutationFn: async (file: File) => {
      const intent = await mintAccountImage(fetcher, file.type);
      await putSignedUpload(intent.upload.signedUrl, file, file.type);
      return (await confirmAccountImage(fetcher, intent.objectKey)).objectKey;
    },
  });
}

export function useUpsertPolicyDocument(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { id?: string; documentName: string; version: string; body: string }) =>
      input.id
        ? createPolicyVersion(fetcher, input.id, {
            version: input.version,
            title: input.documentName,
            body: input.body,
          })
        : createPolicyDocument(fetcher, {
            title: input.documentName,
            slug: input.documentName
              .toLowerCase()
              .trim()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, ""),
            kind: "WAIVER",
            version: input.version,
            body: input.body,
          }),
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.settings.all(role)]),
  });
}

export function useDeletePolicyDocument(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePolicyDocumentRequest(fetcher, id),
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.settings.all(role)]),
  });
}

export function useDeletePolicy(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (documentName: string) => deletePolicyDocumentRequest(fetcher, documentName),
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.settings.all(role)]),
  });
}

export function useSetPolicyFormRequirements(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requirements: PolicyFormRequirements) =>
      putPolicyFormRequirements(fetcher, requirements),
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.settings.all(role)]),
  });
}

export function useUpdateAdminSettings(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: Partial<AdminSettings>) =>
      patchAdminSettings(fetcher, {
        ...(patch.businessName || patch.contact?.phone || patch.contact?.address
          ? {
              section: "business",
              business: {
                name: patch.businessName,
                phone: patch.contact?.phone,
                address: patch.contact?.address,
              },
            }
          : {}),
        ...(patch.about || patch.contact?.email
          ? { section: "content", content: { about: patch.about, email: patch.contact?.email } }
          : {}),
      }),
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.settings.all(role)]),
  });
}

type FaqFormValue = { id: string; question: string; answer: string };

/**
 * FAQ rows use a client-generated id (`faq-<uuid>`) until saved, and
 * `patchAdminSettings` never accepted a `faqs` field — so routing FAQ saves
 * through `useUpdateAdminSettings` silently no-opped (WIRE-1606/1607, #370).
 * Diffs `previous` against `next` into real create/update/delete calls, then
 * reorders by the resulting real ids.
 */
export function useSaveFaqs(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      previous,
      next,
    }: {
      previous: AdminSettings["faqs"];
      next: FaqFormValue[];
    }) => {
      const previousById = new Map(previous.map((faq) => [faq.id, faq]));
      const nextIds = new Set(next.map((faq) => faq.id));
      const removed = previous.filter((faq) => !nextIds.has(faq.id));
      await Promise.all(removed.map((faq) => deleteFaq(fetcher, faq.id)));

      const orderedIds: string[] = [];
      for (const faq of next) {
        const original = previousById.get(faq.id);
        if (original) {
          if (original.question !== faq.question || original.answer !== faq.answer) {
            await patchFaq(fetcher, faq.id, { question: faq.question, answer: faq.answer });
          }
          orderedIds.push(faq.id);
        } else {
          const { faq: created } = await createFaq(fetcher, {
            question: faq.question,
            answer: faq.answer,
          });
          orderedIds.push(created.id);
        }
      }
      await reorderFaqs(fetcher, orderedIds);
    },
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.settings.all(role)]),
  });
}

export function usePromotePolicyVersion(fetcher: ApiFetcher = apiFetchBrowser) {
  const role = useAdminAuthScope();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ documentName, version }: { documentName: string; version: string }) =>
      promotePolicyVersion(fetcher, documentName, { version }),
    onSuccess: () => invalidateForRole(queryClient, [adminKeys.settings.all(role)]),
  });
}
