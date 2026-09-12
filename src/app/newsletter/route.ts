import { NextResponse, type NextRequest } from "next/server";

/**
 * The sitemap lists /newsletter, but the signup is a section on the homepage
 * rather than a page of its own — a standalone page for a single input field
 * would be a dead end. This keeps the URL working instead of 404ing.
 */
export function GET(request: NextRequest) {
  return NextResponse.redirect(new URL("/#newsletter", request.url));
}
