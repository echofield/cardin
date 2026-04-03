import Link from "next/link"

export function MobileStickyInstallBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#CCD4CA] bg-[#FBFAF6]/95 p-3 backdrop-blur sm:hidden">
      <Link
        className="inline-flex h-11 w-full items-center justify-center rounded-full border border-[#173A2E] bg-[#173A2E] px-5 text-sm font-medium text-[#FBFAF6]"
        href="#installation"
      >
        Lancer ma carte - 119€
      </Link>
    </div>
  )
}
