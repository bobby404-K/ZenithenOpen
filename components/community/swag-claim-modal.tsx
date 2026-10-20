"use client";

import * as React from "react";
import {
  X,
  Gift,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Lock,
  Copy,
  Check,
  PackageCheck,
  ShieldCheck,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SwagTier, SwagClaimVoucher } from "@/types";
import { useAuth } from "@/components/auth/auth-context";

interface SwagClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimSuccess?: (voucher: SwagClaimVoucher) => void;
}

interface EvaluatedTier extends SwagTier {
  isEligible: boolean;
  isClaimed: boolean;
}

interface StudentStats {
  username: string;
  name: string;
  mergedPrs: number;
  qualityPrs: number;
}

const APPAREL_SIZES = ["S", "M", "L", "XL", "2XL"] as const;

export function SwagClaimModal({
  isOpen,
  onClose,
  onClaimSuccess,
}: SwagClaimModalProps) {
  const { user } = useAuth();
  const [username, setUsername] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [studentStats, setStudentStats] = React.useState<StudentStats | null>(null);
  const [tiers, setTiers] = React.useState<EvaluatedTier[]>([]);
  const [selectedTier, setSelectedTier] = React.useState<EvaluatedTier | null>(null);
  const [selectedSize, setSelectedSize] = React.useState<string>("L");
  const [pickupLocation, setPickupLocation] = React.useState("Campus Lab 3 (Maintainers Desk)");

  const [voucher, setVoucher] = React.useState<SwagClaimVoucher | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Initialize handle from auth context
  React.useEffect(() => {
    if (user?.githubUsername) {
      setUsername(user.githubUsername);
    }
  }, [user]);

  // Check eligibility when modal opens or handle changes
  const checkEligibility = React.useCallback(async (targetHandle: string) => {
    const clean = targetHandle.trim();
    if (!clean) return;

    setLoading(true);
    setError(null);
    setSelectedTier(null);
    setVoucher(null);

    try {
      const res = await fetch(`/api/community/swag?username=${encodeURIComponent(clean)}`);
      if (!res.ok) throw new Error("Failed to check eligibility");
      const data = await res.json();

      if (data.success) {
        setStudentStats(data.student);
        setTiers(data.tiers);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error checking eligibility";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      const initialHandle = user?.githubUsername || "bobby404-k";
      setUsername(initialHandle);
      checkEligibility(initialHandle);
    } else {
      setSelectedTier(null);
      setVoucher(null);
      setError(null);
    }
  }, [isOpen, user, checkEligibility]);

  if (!isOpen) return null;

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTier) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/community/swag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: studentStats?.username || username.trim(),
          tierId: selectedTier.id,
          size: selectedTier.hasPhysicalSwag ? selectedSize : undefined,
          pickupLocation,
          name: studentStats?.name,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to confirm swag claim");
      }

      setVoucher(data.voucher);
      if (onClaimSuccess) onClaimSuccess(data.voucher);

      // Refresh tiers list
      checkEligibility(username);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Error claiming reward";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const copyVoucher = () => {
    if (voucher?.voucherCode) {
      navigator.clipboard.writeText(voucher.voucherCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-xl rounded-2xl border border-border bg-card p-6 shadow-2xl shadow-primary/10 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 rounded-full border border-border bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-8 shrink-0">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border border-primary/25 bg-primary/10 text-primary text-[10px] font-mono font-bold uppercase tracking-wider">
            <Gift className="h-3 w-3" />
            <span>Contributor Swag Portal</span>
          </div>
          <h2 className="text-xl font-bold text-foreground">
            Check Swag Eligibility & Claim Voucher
          </h2>
          <p className="text-xs text-muted-foreground">
            Rewards are automatically unlocked based on your verified merged campus pull requests.
          </p>
        </div>

        {/* Username Lookup Bar */}
        <div className="mt-4 flex items-center gap-2 shrink-0">
          <div className="relative flex-1">
            <Input
              placeholder="Enter GitHub handle (e.g. bobby404-k)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-9 text-xs font-mono"
            />
          </div>
          <Button
            size="sm"
            onClick={() => checkEligibility(username)}
            disabled={loading || !username.trim()}
            className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold cursor-pointer shrink-0"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <span>Check Stats</span>
            )}
          </Button>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mt-3 flex items-start gap-2 p-3 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs shrink-0">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Content Body (Scrollable) */}
        <div className="mt-4 overflow-y-auto space-y-4 pr-1">
          {/* Confirmed Voucher View */}
          {voucher ? (
            <div className="p-5 rounded-2xl border-2 border-primary/40 bg-card/90 shadow-lg text-center space-y-3">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <PackageCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/25">
                  Official Contributor Voucher
                </span>
                <h3 className="text-lg font-extrabold text-foreground mt-1">
                  Swag Claim Confirmed!
                </h3>
                <p className="text-xs text-muted-foreground">
                  Reserved <strong>{voucher.swagItem}</strong> for @{voucher.username}.
                </p>
              </div>

              {/* Voucher Code Box */}
              <div className="p-3.5 rounded-xl border border-border bg-muted/60 flex items-center justify-between font-mono">
                <div className="text-left">
                  <span className="text-[9px] uppercase tracking-wider text-muted-foreground block">
                    Voucher Code
                  </span>
                  <span className="text-sm font-extrabold text-primary tracking-wider">
                    {voucher.voucherCode}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyVoucher}
                  className="h-8 text-xs cursor-pointer gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </Button>
              </div>

              <div className="text-[11px] text-muted-foreground text-left space-y-1 p-2 rounded-lg bg-card/40 border border-border/60">
                <div>• <strong>Pickup:</strong> {voucher.pickupLocation}</div>
                {voucher.size && <div>• <strong>Apparel Size:</strong> {voucher.size}</div>}
                <div>• <strong>Status:</strong> {voucher.status} (Verified)</div>
              </div>

              <div className="pt-2">
                <Button
                  size="sm"
                  onClick={() => setVoucher(null)}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs cursor-pointer"
                >
                  Done
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Contributor Verified Metrics Badge */}
              {studentStats && (
                <div className="p-3 rounded-xl border border-border bg-muted/40 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <div>
                      <span className="font-bold text-foreground">
                        {studentStats.name}
                      </span>{" "}
                      <span className="text-muted-foreground">
                        (@{studentStats.username})
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 font-semibold">
                    <span className="text-primary font-bold">
                      {studentStats.mergedPrs} Merged PRs
                    </span>
                    <span className="text-muted-foreground hidden sm:inline">
                      • {studentStats.qualityPrs} Quality
                    </span>
                  </div>
                </div>
              )}

              {/* Tiers List */}
              <div className="space-y-2.5">
                {tiers.map((tier) => (
                  <div
                    key={tier.id}
                    className={`rounded-xl border p-3.5 transition-all ${
                      tier.isEligible
                        ? "border-primary/40 bg-card hover:border-primary shadow-xs"
                        : "border-border/60 bg-card/40 opacity-70"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary px-2 py-0.5 rounded bg-primary/10 border border-primary/20">
                            {tier.badge}
                          </span>
                          <span className="text-xs font-bold text-foreground">
                            {tier.name}
                          </span>
                          <span className="text-[10px] font-mono text-muted-foreground">
                            ({tier.minPrs}+ PRs required)
                          </span>
                        </div>
                        <p className="text-xs font-medium text-foreground">
                          {tier.itemTitle}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {tier.rewards.join(" • ")}
                        </p>
                      </div>

                      {/* Status / Claim Button */}
                      <div className="shrink-0 pt-0.5">
                        {tier.isClaimed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/25">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Claimed</span>
                          </span>
                        ) : tier.isEligible ? (
                          <Button
                            size="sm"
                            onClick={() => setSelectedTier(tier)}
                            className="h-8 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cursor-pointer shadow-xs"
                          >
                            <Sparkles className="mr-1 h-3 w-3" />
                            <span>Claim</span>
                          </Button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-mono text-muted-foreground bg-muted/60 px-2 py-1 rounded-md border border-border">
                            <Lock className="h-3 w-3" />
                            <span>Locked</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Claim Form inline when this tier is selected */}
                    {selectedTier?.id === tier.id && (
                      <form
                        onSubmit={handleClaimSubmit}
                        className="mt-3 pt-3 border-t border-border space-y-3 animate-in fade-in duration-150"
                      >
                        {tier.hasPhysicalSwag && (
                          <div className="space-y-1.5">
                            <label className="text-[11px] font-semibold text-foreground">
                              Select Apparel Size
                            </label>
                            <div className="flex gap-2">
                              {APPAREL_SIZES.map((size) => (
                                <button
                                  key={size}
                                  type="button"
                                  onClick={() => setSelectedSize(size)}
                                  className={`h-7 px-3 rounded-lg border text-xs font-mono font-bold transition-colors cursor-pointer ${
                                    selectedSize === size
                                      ? "bg-primary text-primary-foreground border-primary"
                                      : "bg-muted text-muted-foreground border-border hover:text-foreground"
                                  }`}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-foreground">
                            Campus Collection Point
                          </label>
                          <Input
                            value={pickupLocation}
                            onChange={(e) => setPickupLocation(e.target.value)}
                            className="h-8 text-xs font-mono"
                          />
                        </div>

                        <div className="flex justify-end gap-2 pt-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedTier(null)}
                            className="h-8 text-xs cursor-pointer"
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            size="sm"
                            disabled={submitting}
                            className="h-8 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold cursor-pointer"
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                                <span>Generating Voucher...</span>
                              </>
                            ) : (
                              <span>Confirm Claim</span>
                            )}
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
