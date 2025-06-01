import gsap from "gsap";

import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import { setupMarqueeAnimation } from "./marquee";

document.addEventListener("DOMContentLoaded", () => {
	gsap.registerPlugin(ScrollTrigger, SplitText);

	const lenis = new Lenis();

	lenis.on("scroll", ScrollTrigger.update);

	gsap.ticker.add((time) => lenis.raf(time * 1000));
	gsap.ticker.lagSmoothing(0);

	const cards = gsap.utils.toArray(".card");
	const introCard = cards[0];

	const titles = gsap.utils.toArray(".card-title h1");
	titles.forEach((title) => {
		const split = new SplitText(title, {
			type: "char",
			charsClass: "char",
			tag: "div",
		});

		split.chars.forEach((char) => {
			char.innerHTML = `<span>${char.textContent}</span>`;
		});
	});

	const cardImageWrapper = introCard.querySelector(".card-image");
	const cardImage = introCard.querySelector(".card-image img");

	gsap.set(cardImageWrapper, {
		scale: 0.5,
		borderRadius: "400px",
	});
	gsap.set(cardImage, { scale: 1.5 });

	function animateContentIn(titleChars, description) {
		gsap.to(titleChars, { x: "0%", duration: 0.75, ease: "power4.out" });
		gsap.to(description, {
			x: 0,
			opacity: 1,
			duration: 0.75,
			ease: "power4.out",
			delay: 0.1,
		});
	}

	function animateContentOut(titleChars, description) {
		gsap.to(titleChars, { x: "100%", duration: 0.5, ease: "power4.out" });
		gsap.to(description, {
			x: "40px",
			opacity: 0,
			duration: 0.5,
			ease: "power4.out",
		});
	}

	const marquee = introCard.querySelector(".card-marquee .marquee");
	const titleChars = introCard.querySelector(".char span");
	const description = introCard.querySelector(".card-description");

	ScrollTrigger.create({
		trigger: introCard,
		start: "top top",
		end: "+=300vh",
		onUpdate: (self) => {
			const progress = self.progress;
			const imageScale = 0.5 + progress * 0.5;
			const borderRadius = 400 - progress * 375;
			const innerImageScale = 1.5 - progress * 0.5;

			gsap.set(cardImageWrapper, {
				scale: imageScale,
				borderRadius: `${borderRadius}px`,
			});

			gsap.set(cardImage, {
				scale: innerImageScale,
			});

			if (imageScale >= 0.5 && imageScale <= 0.75) {
				const fadeProgress = (imageScale - 0.5) / 0.25;
				gsap.set(marquee, { opacity: 1 - fadeProgress });
			} else if (imageScale < 0.5) {
				gsap.set(marquee, { opacity: 1 });
			} else if (imageScale > 0.75) {
				gsap.set(marquee, { opacity: 0 });
			}

			if (progress >= 1 && !introCard.contentRevealed) {
				introCard.contentRevealed = true;
				animateContentIn(titleChars, description);
			}

			if (progress < 1 && introCard.contentRevealed) {
				introCard.contentRevealed = false;
				animateContentOut(titleChars, description);
			}
		},
	});

	cards.forEach((card, index) => {
		const isLastCard = index === cards.length - 1;
		ScrollTrigger.create({
			trigger: card,
			start: "top top",
			end: isLastCard ? "+=100vh" : "top top",
			endTrigger: isLastCard ? null : cards[cards.length - 1],
			pin: true,
			pinSpacing: isLastCard,
		});
	});

	cards.forEach((card, index) => {
		if (index < cards.length - 1) {
			const cardWrapper = card.querySelector(".card-wrapper");
			ScrollTrigger.create({
				trigger: cards[index + 1],
				start: "top bottom",
				end: "top top",
				onUpdate: (self) => {
					const progress = self.progress;
					gsap.set(cardWrapper, {
						scale: 1 - progress * 0.25,
						opacity: 1 - progress,
					});
				},
			});
		}
	});

	cards.forEach((card, index) => {
		if (index > 0) {
			const cardImage = card.querySelector(".card-image img");
			const ImageWrapper = card.querySelector(".card-image");
			ScrollTrigger.create({
				trigger: card,
				start: "top bottom",
				end: "top top",
				onUpdate: (self) => {
					const progress = self.progress;
					gsap.set(cardImage, {
						scale: 2 - progress,
					});
					gsap.set(ImageWrapper, {
						borderRadius: `${150 - progress * 125}px`,
					});
				},
			});
		}
	});

	cards.forEach((card, index) => {
		if (index === 0) return;

		const cardDescription = card.querySelector(".card-description");
		const cardTitleChars = card.querySelectorAll(".char span");

		ScrollTrigger.create({
			trigger: card,
			start: "top top",
			onEnter: () => animateContentIn(cardTitleChars, cardDescription),
			onLeaveBack: () => animateContentOut(cardTitleChars, cardDescription),
		});
	});

	setupMarqueeAnimation();
});
