import { MARKETING_ASPECT_RATIOS, publicPageSlotIds } from "@balanse/domain";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CoachPhoto, MarketingImage } from "./MarketingImage";

const meta = {
  title: "Shared/MarketingAssets",
} satisfies Meta;

export default meta;

export const PublicPageSlots: StoryObj = {
  render: () => (
    <div className="grid gap-6 p-4">
      {(["landing", "about", "contact", "faqs", "coaches"] as const).map((page) => (
        <section key={page}>
          <h2 className="mb-3 font-display text-xl capitalize">{page}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {publicPageSlotIds(page).map((id) => (
              <MarketingImage key={id} assetId={id} />
            ))}
          </div>
        </section>
      ))}
    </div>
  ),
};

export const AspectRatioFrames: StoryObj = {
  render: () => (
    <div className="grid gap-4 p-4 md:grid-cols-2">
      {MARKETING_ASPECT_RATIOS.map((ratio) => (
        <div key={ratio}>
          <p className="mb-2 text-sm text-muted-foreground">{ratio}</p>
          <MarketingImage assetId={ratio === "4:5" ? "coaches-a" : "landing-a"} />
        </div>
      ))}
    </div>
  ),
};

export const CoachHeadshots: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-4 p-4">
      <CoachPhoto photoKey={null} name="Alec James Co" ratio="4:5" className="w-40" />
      <CoachPhoto
        photoKey="coach-photos/ephraim-bacaltos"
        name="Ephraim Bacaltos"
        ratio="4:5"
        className="w-40"
      />
      <CoachPhoto photoKey="coach-photos/wolf" name="Wolf" ratio="1:1" className="w-32" />
      <CoachPhoto
        photoKey="/missing-on-purpose.png"
        name="Broken path"
        ratio="1:1"
        className="w-32"
      />
    </div>
  ),
};
