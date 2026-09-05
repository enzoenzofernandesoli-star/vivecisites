import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

// Registra uma vez só. Guarda contra o duplo-mount do StrictMode e contra
// múltiplos imports: registerPlugin é idempotente, mas config não precisa rodar duas vezes.
gsap.registerPlugin(ScrollTrigger, SplitText);
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger, SplitText };
