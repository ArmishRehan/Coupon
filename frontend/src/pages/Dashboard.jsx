import CouponButton from "../components/CouponButton";
import Navbar from "../components/Navbar";
import ShowCouponButton from "../components/ShowCouponsButton";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient flex flex-col">
      <Navbar />
      <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-12">
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md flex justify-center">
          <CouponButton />
        </div>
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md flex justify-center">
          <ShowCouponButton />
        </div>
      </div>
    </div>
  );
}
