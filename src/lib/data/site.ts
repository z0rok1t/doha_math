import { loadSiteContent } from "@/lib/data/source";
import type { SiteContent } from "@/lib/types";

/** Bio, stat rows, social links and press — everything copy-level. */
export async function getSiteContent(): Promise<SiteContent> {
  return loadSiteContent();
}
