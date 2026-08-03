"use client";

import Image from "next/image";
import Link from "next/link";
import { Phone, Instagram, Facebook, Youtube } from "lucide-react";
import { siteImages } from "@/lib/site-images";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Subjects", href: "/subjects" },
  { label: "Pricing", href: "/pricing" },
  { label: "Book a Session", href: "/book" },
  { label: "Contact", href: "/contact" },
  { label: "Scholarship", href: "/step-up-for-students" },
];

const serviceLinks = [
  { label: "SAT Tutoring", href: "/test-prep/sat" },
  { label: "ACT Tutoring", href: "/test-prep/act" },
  { label: "LSAT Tutoring", href: "/test-prep/lsat" },
  { label: "GRE Tutoring", href: "/test-prep/gre" },
  { label: "GMAT Tutoring", href: "/test-prep/gmat" },
  { label: "College Tutoring", href: "/college-tutoring" },
  {
    label: "High School Tutoring",
    href: "/high-school-tutoring",
  },
  {
    label: "Middle School Tutoring",
    href: "/middle-school-tutoring",
  },
  {
    label: "Elementary Tutoring",
    href: "/elementary-tutoring",
  },
];

const socialLinks = [
  { icon: Instagram, href: "https://www.instagram.com/scoremaxtutoring", label: "Instagram" },
  { icon: Facebook, href: "https://www.facebook.com/scoremaxtutoring", label: "Facebook" },
  { icon: Youtube, href: "https://www.youtube.com/@scoremaxtutoring", label: "YouTube" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        {/* Two columns on phones — Quick Links and Services side by side —
            otherwise the footer stacks into one enormous single-column list. */}
        <div className="py-8 sm:py-12 grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-4">
              <Image
                src={siteImages.logoWhite}
                alt="ScoreMax Tutoring"
                width={360}
                height={108}
                className="h-12 sm:h-16 w-auto"
              />
            </Link>
            <p className="text-sm leading-relaxed text-white/50 mb-5">
              Empowering students to reach their full academic potential through
              personalized, expert tutoring.
            </p>
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 flex items-center justify-center bg-gray-700 text-white hover:bg-[#b08a30] transition-colors duration-200"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white/80 font-semibold text-sm uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-[#b08a30] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white/80 font-semibold text-sm uppercase tracking-wider mb-4">
              Services
            </h3>
            <ul className="space-y-2.5">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-[#b08a30] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-white/80 font-semibold text-sm uppercase tracking-wider mb-4">
              Contact Us
            </h3>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="tel:9542148880"
                  className="flex items-center gap-3 text-sm text-white/70 hover:text-[#b08a30] transition-colors duration-200"
                >
                  <Phone className="w-4 h-4 text-[#b08a30] shrink-0" />
                  (954) 214-8880
                </a>
              </li>
            </ul>

            <div className="mt-6">
              <Link
                href="/contact"
                className="inline-block bg-[#b08a30] text-white text-sm font-medium px-5 py-2.5 hover:bg-[#9a7628] transition-colors duration-200 font-[family-name:var(--font-playfair)]"
              >
                Book Free Consultation
              </Link>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/20" />

        {/* Bottom Bar */}
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/50">
            &copy; {currentYear} ScoreMax Tutoring. All rights reserved.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <Link
              href="/contact"
              className="text-xs text-white/40 hover:text-white/70 transition-colors duration-200"
            >
              Contact Us
            </Link>
            <Link
              href="/privacy"
              className="text-xs text-white/40 hover:text-white/70 transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs text-white/40 hover:text-white/70 transition-colors duration-200"
            >
              Terms of Service
            </Link>
            <Link
              href="/refund-policy"
              className="text-xs text-white/40 hover:text-white/70 transition-colors duration-200"
            >
              Refund Policy
            </Link>
            <Link
              href="/accessibility"
              className="text-xs text-white/40 hover:text-white/70 transition-colors duration-200"
            >
              Accessibility
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
