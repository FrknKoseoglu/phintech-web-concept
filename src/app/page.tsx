export default function Home() {
  return (
    <div className="p-6 lg:p-8 max-w-[1920px] mx-auto w-full">
      {/* Placeholder - Dashboard components coming next */}
      <div className="bg-surface-dark rounded-xl p-8 border border-border-dark">
        <h1 className="text-2xl font-bold text-white mb-4">
          Midas Investment Dashboard
        </h1>
        <p className="text-gray-400">
          Dashboard components will be implemented here. Layout is ready with
          Navbar and Footer.
        </p>
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-background-dark p-4 rounded-lg border border-border-dark">
            <span className="text-success text-sm font-medium">✓ Navbar</span>
          </div>
          <div className="bg-background-dark p-4 rounded-lg border border-border-dark">
            <span className="text-success text-sm font-medium">✓ Footer</span>
          </div>
          <div className="bg-background-dark p-4 rounded-lg border border-border-dark">
            <span className="text-success text-sm font-medium">✓ Tailwind Theme</span>
          </div>
        </div>
      </div>
    </div>
  );
}
