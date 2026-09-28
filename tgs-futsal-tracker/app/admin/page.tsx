import { loginAdmin } from "@/lib/actions";

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="max-w-sm mx-auto py-16">
      <h1 className="font-display text-2xl text-ink mb-1">Match Control</h1>
      <p className="text-sm text-[#5B6B62] mb-6">
        For tournament organisers only.
      </p>
      <form action={loginAdmin} className="space-y-4">
        <input
          type="password"
          name="password"
          placeholder="Admin password"
          required
          className="w-full border border-[#DAD6C8] bg-white px-3 py-2 text-sm focus:outline-none focus-visible:outline-2 focus-visible:outline-amber"
        />
        {searchParams.error && (
          <p className="text-sm text-alert">Wrong password — try again.</p>
        )}
        <button
          type="submit"
          className="w-full bg-pitch text-bone py-2 text-sm font-medium hover:bg-pitch-dark transition-colors"
        >
          Enter
        </button>
      </form>
    </div>
  );
}
