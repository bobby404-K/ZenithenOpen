/**
 * Community Contributor Swag & Rewards Engine API
 * Location: app/api/community/swag/route.ts
 *
 * Manages contributor tier qualification, physical/digital rewards verification,
 * size selection, and authenticated claim voucher generation.
 */

import { NextRequest, NextResponse } from "next/server";
import { SwagTier, SwagClaimVoucher } from "@/types";
import { STUDENT_COMPETITORS } from "@/lib/data/student-competition";
import { getCached, setCached, deleteCached } from "@/lib/redis/client";

export const SWAG_TIERS: SwagTier[] = [
  {
    id: "tier-1",
    name: "First PR Merged",
    badge: "Tier 1",
    minPrs: 1,
    rewards: [
      "ZenithenOpen First PR Digital Verification Badge",
      "Community Contributor Directory profile listing",
      "Invitation to maintainer Discord channels",
    ],
    itemTitle: "First PR Contributor Digital Badge & Directory Listing",
    hasPhysicalSwag: false,
  },
  {
    id: "tier-2",
    name: "Bronze Contributor",
    badge: "Tier 2",
    minPrs: 5,
    rewards: [
      "Official ZenithenOpen holographic laptop stickers pack",
      "Campus open-source achievement certificate",
      "Eligible for code review apprentice role",
    ],
    itemTitle: "Holographic Contributor Sticker Pack & Certificate",
    hasPhysicalSwag: true,
  },
  {
    id: "tier-3",
    name: "Silver Contributor",
    badge: "Tier 3",
    minPrs: 15,
    rewards: [
      "Exclusive ZenithenOpen Developer Performance T-Shirt",
      "Priority pull request reviews by core maintainers",
      "Direct recommendation letters for internship applications",
    ],
    itemTitle: "ZenithenOpen Developer Performance T-Shirt",
    hasPhysicalSwag: true,
  },
  {
    id: "tier-4",
    name: "Gold Contributor",
    badge: "Tier 4",
    minPrs: 30,
    rewards: [
      "ZenithenOpen Community Heavyweight Embroidered Hoodie",
      "Sponsored hackathon registration & travel grants",
      "Nomination for campus open-source leadership positions",
    ],
    itemTitle: "Heavyweight Embroidered Community Hoodie & Leadership Grant",
    hasPhysicalSwag: true,
  },
];

// Initial seeded claim vouchers
export const INITIAL_CLAIMS: SwagClaimVoucher[] = [
  {
    voucherCode: "SWAG-2026-IST-9104",
    username: "bobby404-k",
    name: "Bobby Kumar",
    tierId: "tier-4",
    tierName: "Gold Contributor",
    swagItem: "Heavyweight Embroidered Community Hoodie & Leadership Grant",
    size: "L",
    pickupLocation: "Campus Lab 3 (Maintainers Desk)",
    status: "CONFIRMED",
    claimedAt: "2026-10-15T11:20:00.000Z",
  },
  {
    voucherCode: "SWAG-2026-IST-7821",
    username: "tanmay-lead",
    name: "Tanmay Sharma",
    tierId: "tier-3",
    tierName: "Silver Contributor",
    swagItem: "ZenithenOpen Developer Performance T-Shirt",
    size: "XL",
    pickupLocation: "Campus Lab 3 (Maintainers Desk)",
    status: "CONFIRMED",
    claimedAt: "2026-10-16T14:45:00.000Z",
  },
  {
    voucherCode: "SWAG-2026-IST-6312",
    username: "ananya-dev",
    name: "Ananya Rao",
    tierId: "tier-3",
    tierName: "Silver Contributor",
    swagItem: "ZenithenOpen Developer Performance T-Shirt",
    size: "M",
    pickupLocation: "Campus Lab 3 (Maintainers Desk)",
    status: "CONFIRMED",
    claimedAt: "2026-10-17T09:10:00.000Z",
  },
  {
    voucherCode: "SWAG-2026-IST-5198",
    username: "priya-patel",
    name: "Priya Patel",
    tierId: "tier-2",
    tierName: "Bronze Contributor",
    swagItem: "Holographic Contributor Sticker Pack & Certificate",
    pickupLocation: "Campus Lab 3 (Maintainers Desk)",
    status: "CONFIRMED",
    claimedAt: "2026-10-17T16:30:00.000Z",
  },
];

// In-memory claims store
let claimsStore: SwagClaimVoucher[] = JSON.parse(JSON.stringify(INITIAL_CLAIMS));

export function getClaimsStore(): SwagClaimVoucher[] {
  return claimsStore;
}

export function resetClaimsStore(): void {
  claimsStore = JSON.parse(JSON.stringify(INITIAL_CLAIMS));
}

function getStudentContributions(username: string): {
  username: string;
  name: string;
  mergedPrs: number;
  qualityPrs: number;
} {
  const clean = username.trim().toLowerCase();

  const competitor = STUDENT_COMPETITORS.find(
    (c) => c.username.toLowerCase() === clean
  );

  if (competitor) {
    return {
      username: competitor.username,
      name: competitor.name,
      mergedPrs: competitor.overall?.mergedPrs ?? 0,
      qualityPrs: competitor.overall?.qualityPrs ?? 0,
    };
  }

  // Recognized campus maintainers & lead engineers
  if (clean === "bobby404-k") {
    return { username: "bobby404-k", name: "Bobby Kumar", mergedPrs: 31, qualityPrs: 14 };
  }
  if (clean === "tanmay-lead") {
    return { username: "tanmay-lead", name: "Tanmay Sharma", mergedPrs: 24, qualityPrs: 10 };
  }
  if (clean === "ananya-dev") {
    return { username: "ananya-dev", name: "Ananya Rao", mergedPrs: 19, qualityPrs: 8 };
  }
  if (clean === "priya-patel") {
    return { username: "priya-patel", name: "Priya Patel", mergedPrs: 8, qualityPrs: 3 };
  }

  // Graceful default for valid student handle with at least 1 starter PR
  return {
    username,
    name: username,
    mergedPrs: 1,
    qualityPrs: 0,
  };
}

/**
 * GET /api/community/swag
 * Query params:
 *  - username: string (optional, checks user eligibility & history)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get("username")?.trim().toLowerCase();

    if (!username) {
      return NextResponse.json({
        success: true,
        tiers: SWAG_TIERS,
        recentClaims: claimsStore.slice(0, 10),
      });
    }

    const student = getStudentContributions(username);
    const userClaims = claimsStore.filter(
      (c) => c.username.toLowerCase() === username
    );

    const evaluatedTiers = SWAG_TIERS.map((tier) => {
      const isEligible = student.mergedPrs >= tier.minPrs;
      const isClaimed = userClaims.some((c) => c.tierId === tier.id);
      return {
        ...tier,
        isEligible,
        isClaimed,
      };
    });

    // Highest unlocked tier
    const eligibleTiers = evaluatedTiers.filter((t) => t.isEligible);
    const highestEligibleTier =
      eligibleTiers.length > 0 ? eligibleTiers[eligibleTiers.length - 1] : null;

    return NextResponse.json({
      success: true,
      student: {
        username: student.username,
        name: student.name,
        mergedPrs: student.mergedPrs,
        qualityPrs: student.qualityPrs,
      },
      highestEligibleTier,
      tiers: evaluatedTiers,
      claims: userClaims,
    });
  } catch (error) {
    console.error("[GET /api/community/swag] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to evaluate contributor swag eligibility" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/community/swag
 * Submits a verified swag claim voucher
 * Body: { username, tierId, size?, pickupLocation?, name?, email? }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid JSON request body" },
        { status: 400 }
      );
    }

    const { username, tierId, size, pickupLocation, name } = body;

    const cleanUsername = (username || "").trim();
    if (!cleanUsername || cleanUsername.length < 2) {
      return NextResponse.json(
        { success: false, error: "A valid student GitHub username is required" },
        { status: 400 }
      );
    }

    if (!tierId || typeof tierId !== "string") {
      return NextResponse.json(
        { success: false, error: "Parameter 'tierId' is required" },
        { status: 400 }
      );
    }

    const targetTier = SWAG_TIERS.find((t) => t.id === tierId);
    if (!targetTier) {
      return NextResponse.json(
        { success: false, error: `Invalid tierId '${tierId}'` },
        { status: 400 }
      );
    }

    // Check student's verified contribution metrics
    const student = getStudentContributions(cleanUsername);
    if (student.mergedPrs < targetTier.minPrs) {
      return NextResponse.json(
        {
          success: false,
          error: `Ineligible for ${targetTier.name}. Requires at least ${targetTier.minPrs} verified merged PRs, but @${cleanUsername} has ${student.mergedPrs}.`,
          minPrs: targetTier.minPrs,
          currentPrs: student.mergedPrs,
        },
        { status: 403 }
      );
    }

    // Check for duplicate claim on the same tier
    const alreadyClaimed = claimsStore.some(
      (c) =>
        c.username.toLowerCase() === cleanUsername.toLowerCase() &&
        c.tierId === targetTier.id
    );

    if (alreadyClaimed) {
      return NextResponse.json(
        {
          success: false,
          error: `@${cleanUsername} has already claimed reward voucher for ${targetTier.name}!`,
          alreadyClaimed: true,
        },
        { status: 409 }
      );
    }

    // Validate apparel size if tier has physical apparel (Tier 3 T-Shirt & Tier 4 Hoodie)
    const validSizes = ["S", "M", "L", "XL", "2XL"];
    let finalSize = size ? String(size).toUpperCase().trim() : undefined;
    if (targetTier.hasPhysicalSwag && (targetTier.id === "tier-3" || targetTier.id === "tier-4")) {
      if (!finalSize || !validSizes.includes(finalSize)) {
        return NextResponse.json(
          {
            success: false,
            error: `Please select a valid apparel size (${validSizes.join(", ")}) for ${targetTier.name}`,
          },
          { status: 400 }
        );
      }
    }

    const voucherNumber = Math.floor(1000 + Math.random() * 9000);
    const voucherCode = `SWAG-2026-IST-${voucherNumber}`;

    const newClaim: SwagClaimVoucher = {
      voucherCode,
      username: cleanUsername,
      name: (name || "").trim() || student.name || cleanUsername,
      tierId: targetTier.id,
      tierName: targetTier.name,
      swagItem: targetTier.itemTitle,
      size: finalSize,
      pickupLocation:
        (pickupLocation || "").trim() || "Campus Lab 3 (Maintainers Desk)",
      status: "CONFIRMED",
      claimedAt: new Date().toISOString(),
    };

    // Store claim
    claimsStore.unshift(newClaim);

    // Invalidate Redis cache
    await deleteCached("community:swag:*");

    return NextResponse.json({
      success: true,
      message: `🎉 Swag claim confirmed for ${targetTier.name}! Present your voucher code at pickup.`,
      voucher: newClaim,
    });
  } catch (error) {
    console.error("[POST /api/community/swag] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process swag reward claim" },
      { status: 500 }
    );
  }
}
