
import "../componentsStyle/footer.css";
import { FaWhatsapp, FaInstagram, FaUserShield } from "react-icons/fa";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-left">
        © {new Date().getFullYear()} Fábim Barbearia
      </div>

      <div className="footer-links">
        <a
          href="https://wa.me/5584987411833"
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp"
        >
          <FaWhatsapp className="whatsapp" />
        </a>

        <a
          href="https://www.instagram.com/fabim_barbearia?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
          target="_blank"
          rel="noreferrer"
          aria-label="Instagram"
        >
          <FaInstagram className="insta" />
        </a>
        <Link
          to="/admin"
          aria-label="Painel Admin"
          className="footer-admin"
        >
          <FaUserShield className="admin" />
        </Link>
      </div>
    </footer>
  );
}
