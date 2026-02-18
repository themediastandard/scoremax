"use client";

import Image from "next/image";
import Link from "next/link";
import { Phone, Mail, Instagram, Facebook, Youtube } from "lucide-react";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Tutors", href: "/tutors" },
  { label: "Subjects", href: "/subjects" },
  { label: "Pricing", href: "/pricing" },
  { label: "Book a Session", href: "/book" },
  { label: "Contact", href: "/contact" },
  { label: "Scholarship", href: "/step-up-for-students" },
];

const serviceLinks = [
  { label: "SAT Tutoring", href: "/test-prep/sat" },
  { label: "ACT Tutoring", href: "/test-prep/act" },
  { label: "In Person Classes", href: "/test-prep/in-person-classes" },
  { label: "College Tutoring", href: "/college-high-school/college-tutoring" },
  {
    label: "High School Tutoring",
    href: "/college-high-school/high-school-tutoring",
  },
];

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 sm:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand Column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-5">
              <Image
                src="/Images/score-max-logo-white.png"
                alt="ScoreMax Tutoring"
                width={360}
                height={108}
                className="h-16 w-auto"
              />
            </Link>
            <p className="text-sm leading-relaxed text-white/50 mb-6">
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
            <h3 className="text-white/80 font-semibold text-sm uppercase tracking-wider mb-5">
              Quick Links
            </h3>
            <ul className="space-y-3">
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
            <h3 className="text-white/80 font-semibold text-sm uppercase tracking-wider mb-5">
              Services
            </h3>
            <ul className="space-y-3">
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
          <div>
            <h3 className="text-white/80 font-semibold text-sm uppercase tracking-wider mb-5">
              Contact Us
            </h3>
            <ul className="space-y-4">
              <li>
                <a
                  href="tel:9542148880"
                  className="flex items-center gap-3 text-sm text-white/70 hover:text-[#b08a30] transition-colors duration-200"
                >
                  <Phone className="w-4 h-4 text-[#b08a30] shrink-0" />
                  (954) 214-8880
                </a>
              </li>
              <li>
                <a
                  href="tel:9542241511"
                  className="flex items-center gap-3 text-sm text-white/70 hover:text-[#b08a30] transition-colors duration-200"
                >
                  <Phone className="w-4 h-4 text-[#b08a30] shrink-0" />
                  (954) 224-1511
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@scoremaxtutoring.com"
                  className="flex items-center gap-3 text-sm text-white/70 hover:text-[#b08a30] transition-colors duration-200"
                >
                  <Mail className="w-4 h-4 text-[#b08a30] shrink-0" />
                  info@scoremaxtutoring.com
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
          <div className="flex items-center gap-6">
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
          </div>
        </div>
      </div>
    </footer>
  );
}
