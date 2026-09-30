import Link from "next/link";
import { Shield } from "@/components/brand/Brand";
import { Corners } from "@/components/ui/Corners";
import { Icon } from "@/components/ui/Icon";
import { CENTER } from "@/lib/center-info";

/** شريط الهوية المختصر (1a) — يقود إلى صفحة «هوية ترست درايف» */
export function IdentityStrip() {
  return (
    <section className="page">
      <Link href="/about" className="blueprint ident">
        <Corners />
        <Shield size={40} />
        <div>
          <div className="ident-say">{CENTER.belief}</div>
          <span className="sec-link" style={{ marginTop: 6 }}>
            هوية ترست درايف
            <Icon name="chevronLeft" size={15} />
          </span>
        </div>
      </Link>
    </section>
  );
}
