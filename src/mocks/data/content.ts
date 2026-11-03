import type {
  Article,
  HeroSlide,
  InstagramPost,
} from "@/types/content";

export const mockSlides: HeroSlide[] = [
  {
    id: "s1",
    eyebrow: "New · Atlas Rover",
    title: "Autonomous robots, built by you.",
    description:
      "All-terrain rover kits with LiDAR, ROS 2 and a step-by-step build guide.",
    image: "/images/hero-1.svg",
    imageAlt: "Atlas all-terrain rover illustration",
    primaryCta: { label: "Shop robot kits", href: "/category/robot-kits" },
    secondaryCta: { label: "Learn more", href: "/products/atlas-rover-kit" },
  },
  {
    id: "s2",
    eyebrow: "Drones",
    title: "Fly further. Film sharper.",
    description: "From 4K camera drones to brushless FPV racers, all tested by our team.",
    image: "/images/hero-2.svg",
    imageAlt: "Quadcopter drone illustration",
    primaryCta: { label: "Explore drones", href: "/category/drones" },
  },
  {
    id: "s3",
    eyebrow: "Arduino & ESP32",
    title: "Prototype in an afternoon.",
    description: "Boards, starter kits and modules, in stock and shipped in 24 hours.",
    image: "/images/hero-3.svg",
    imageAlt: "Microcontroller board illustration",
    primaryCta: { label: "Shop boards", href: "/category/arduino-boards" },
    secondaryCta: { label: "Best sellers", href: "/products?sort=bestselling" },
  },
  {
    id: "s4",
    eyebrow: "Robotic arms",
    title: "Precision on your desk.",
    description: "6-DOF arms with Python and ROS APIs for labs, classrooms and makers.",
    image: "/images/hero-4.svg",
    imageAlt: "Desktop robotic arm illustration",
    primaryCta: { label: "See robotic arms", href: "/category/robotic-arms" },
  },
];

export const mockArticles: Article[] = [
  {
    slug: "choosing-your-first-robot-kit",
    title: "How to choose your first robot kit",
    excerpt: "Motors, controllers and sensors explained, so you buy once and build more.",
    image: "/images/wide-1.svg",
    category: "Guides",
    author: "Stem Robo Hub Team",
    publishedAt: "2026-10-18",
    readMinutes: 6,
  },
  {
    slug: "esp32-vs-arduino-uno-r4",
    title: "ESP32 vs Arduino UNO R4: which should you pick?",
    excerpt: "A practical comparison of speed, connectivity and ecosystem for robotics.",
    image: "/images/wide-2.svg",
    category: "Comparison",
    author: "Aarav Mehta",
    publishedAt: "2026-10-04",
    readMinutes: 8,
  },
  {
    slug: "build-a-line-follower-in-an-hour",
    title: "Build a line follower robot in under an hour",
    excerpt: "Wiring, calibration and PID tuning from scratch, with code.",
    image: "/images/wide-3.svg",
    category: "Tutorials",
    author: "Isha Nair",
    publishedAt: "2026-09-21",
    readMinutes: 10,
  },
];

export const mockInstagramPosts: InstagramPost[] = [
  { id: "ig-1", caption: "Our new rover kit on its first run", thumbnail: "/images/kits.svg", permalink: "https://www.instagram.com/reel/mock-1/" },
  { id: "ig-2", caption: "FPV drone test flight", thumbnail: "/images/drones.svg", permalink: "https://www.instagram.com/reel/mock-2/" },
  { id: "ig-3", caption: "Soldering tips for beginners", thumbnail: "/images/power.svg", permalink: "https://www.instagram.com/reel/mock-3/" },
  { id: "ig-4", caption: "Robotic arm picks and places", thumbnail: "/images/arms.svg", permalink: "https://www.instagram.com/reel/mock-4/" },
  { id: "ig-5", caption: "Vision sensor object tracking demo", thumbnail: "/images/vision.svg", permalink: "https://www.instagram.com/reel/mock-5/" },
  { id: "ig-6", caption: "Motor driver wiring in 30 seconds", thumbnail: "/images/motors.svg", permalink: "https://www.instagram.com/reel/mock-6/" },
];
