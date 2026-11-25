
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Heart,
} from "lucide-react";

import {
  FaInstagram,
  FaFacebookF,
  FaYoutube,
  FaLinkedinIn,
} from "react-icons/fa";

import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#071F22] px-5 pb-6 pt-16 text-white">
      {/* Background decoration */}
      <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-[#D7AE59]/[0.06] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#174B50]/30 blur-3xl" />

      <div className="relative mx-auto max-w-7xl lg:px-8">

        {/* Newsletter banner */}
        <div className="mb-14 grid gap-6 rounded-3xl border border-[#D7AE59]/20 bg-[#10383A] p-7 sm:p-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="text-[10px] font-bold tracking-[0.22em] text-[#D7AE59]">
              STAY IN THE LOOP
            </p>

            <h2 className="mt-3 font-heading text-3xl font-semibold sm:text-4xl">
              Good finds. <span className="italic text-[#E8C77F]">Good stories.</span>
            </h2>

            <p className="mt-3 max-w-md text-xs leading-7 text-[#B9C9C3]">
              Subscribe to hear about fresh arrivals, special offers and smarter ways to shop.
            </p>
          </div>

          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              alert("Thank you for subscribing to RELOOP!");
              e.currentTarget.reset();
            }}
          >
            <input
              type="email"
              required
              placeholder="Enter your email address"
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#071F22] px-4 py-3.5 text-xs text-white outline-none transition focus:border-[#D7AE59] placeholder:text-[#829B92]"
            />

            <button
              type="submit"
              className="rounded-xl bg-[#D7AE59] px-6 py-3.5 text-xs font-bold text-[#092F33] transition duration-300 hover:scale-105 hover:bg-[#E8C77F] hover:shadow-lg hover:shadow-[#D7AE59]/20"
            >
              Subscribe
            </button>
          </form>
        </div>

        {/* Main footer columns */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.2fr_0.8fr_1fr_1fr_1.5fr]">

          {/* Brand */}
          <div className="lg:col-span-2">
            <img
              src="/reloop-logo.png"
              alt="RELOOP"
              className="h-15 w-auto object-contain"
            />

            <p className="mt-4 max-w-sm text-[14px] leading-7 text-[#AFC3BC]">
              Give products a second life. Discover quality-checked pre-owned
              finds, transparent condition details and better value. Shop
              thoughtfully. Reuse meaningfully.
            </p>

            <h3 className="mt-7 text-[10px] font-bold tracking-[0.18em] text-[#E8C77F]">
              FOLLOW OUR JOURNEY
            </h3>

            <div className="mt-4 flex items-center gap-3">
              {[
                { icon: FaInstagram, name: "Instagram", url: "https://www.instagram.com/" },
                { icon: FaFacebookF, name: "Facebook", url: "https://www.facebook.com/" },
                { icon: FaYoutube, name: "YouTube", url: "https://www.youtube.com/" },
                { icon: FaLinkedinIn, name: "LinkedIn", url: "https://www.linkedin.com/" },
              ].map(({ icon: Icon, name, url }) => (
                <a
                  key={name}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-[#C4D4CF] transition-all duration-300 hover:-translate-y-1 hover:border-[#D7AE59] hover:bg-[#D7AE59] hover:text-[#092F33]"
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-[10px] font-bold tracking-wider text-[#E8C77F]">
              EXPLORE
            </h3>

            <div className="mt-5 flex flex-col gap-4 text-[14px] text-[#B9C9C3]">
              {[
                ["Home", "/"],
                ["Categories", "/#categories"],
                ["Shop products", "/shop"],
                ["Our promise", "/#story"],
                ["Our impact", "/#impact"],
              ].map(([label, link]) => (
                <Link
                  key={label}
                  to={link}
                  className="w-fit transition-all duration-300 hover:translate-x-1 hover:text-[#E8C77F]"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Customer support */}
          <div>
            <h3 className="text-[10px] font-bold tracking-wider text-[#E8C77F]">
              CUSTOMER CARE
            </h3>

            
<div className="mt-5 flex flex-col gap-4 text-[14px] text-[#B9C9C3]">
  <Link
    to="/track-order"
    className="w-fit transition-all duration-300 hover:translate-x-1 hover:text-[#E8C77F]"
  >
    Track Your Order
  </Link>
  <Link
    to="/enquiry"
    className="w-fit transition-all duration-300 hover:translate-x-1 hover:text-[#E8C77F]"
  >
    Enquiry
  </Link>

  {[
    ["FAQs", "#faq"],
    ["Shipping information", "#shipping"],
    ["Return policy", "#returns"],
    ["Privacy policy", "#privacy"],
    ["Terms & conditions", "#terms"],
  ].map(([label, link]) => (
    <a
      key={label}
      href={link}
      className="w-fit transition-all duration-300 hover:translate-x-1 hover:text-[#E8C77F]"
    >
      {label}
    </a>
  ))}
</div>

          </div>

          {/* Contact */}
          <div className="min-w-0 lg:pl-3">
            <h3 className="text-[10px] font-bold tracking-wider text-[#E8C77F]">
              GET IN TOUCH
            </h3>

            <div className="mt-5 flex flex-col gap-3 text-[14px] text-[#B9C9C3]">

              <div className="flex items-start gap-3">
                <Mail size={16} className="mt-0.5 shrink-0 text-[#D7AE59]" />
                <div>
                  <p className="font-semibold text-white">Email us</p>
                  <a
                    href="mailto:reloopproducts@gmail.com"
                    className="mt-1 inline-block break-all text-xs hover:text-[#E8C77F]"
                  >
                    reloopproducts@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone size={16} className="mt-0.5 shrink-0 text-[#D7AE59]" />
                <div>
                  <p className="font-semibold text-white">Call us</p>
                  <a
                    href="tel:+910000000000"
                    className="mt-1 inline-block whitespace-nowrap hover:text-[#E8C77F]"
                  >
                    +91 12345 67890
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-[#D7AE59]" />
                <div>
                  <p className="font-semibold text-white">Our location</p>
                  <p className="mt-1 leading-6">
                    Tirunelveli<br />
                    Tamil Nadu, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock size={16} className="mt-0.5 shrink-0 text-[#D7AE59]" />
                <div>
                  <p className="font-semibold text-white">Support hours</p>
                  <p className="mt-1">Monday – Saturday</p>
                  <p className="mt-1">9:00 AM – 6:00 PM</p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-center sm:flex-row">
          <p className="text-[10px] text-[#829B92]">
            © 2026 RELOOP. Give Products a Second Life.
          </p>

          <p className="text-[10px] text-[#829B92]">
            Made with <Heart size={11} className="mx-1 inline text-[#D7AE59]" /> for a more thoughtful tomorrow.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
