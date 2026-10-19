/**
 * Utility for smooth, reliable scrolling to page sections across all pages and states.
 */
export const scrollToSection = (sectionId: string, offset = -75) => {
  if (typeof window === "undefined") return;

  const cleanId = sectionId.replace(/^[/#]+/, "");

  // If on an inner page, navigate to homepage with hash
  if (window.location.pathname !== "/") {
    window.location.href = `/#${cleanId}`;
    return;
  }

  // 1. Tell KeyboardScroll and other components to unlock scrolling
  window.dispatchEvent(new CustomEvent("unlock-scroll"));

  // 2. Resume Lenis if initialized
  const lenis = (window as any).lenis;
  if (lenis && typeof lenis.start === "function") {
    lenis.start();
  }

  // 3. Update hash in browser URL history cleanly
  if (window.history.pushState) {
    window.history.pushState(null, "", `#${cleanId}`);
  }

  // 4. Scroll to target element
  const el = document.getElementById(cleanId);
  if (el) {
    if (lenis && typeof lenis.scrollTo === "function") {
      lenis.scrollTo(el, { offset, duration: 1.1 });
    } else {
      const top = el.getBoundingClientRect().top + window.scrollY + offset;
      window.scrollTo({ top, behavior: "smooth" });
    }
  }
};
