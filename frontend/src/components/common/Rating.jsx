import { FaStar, FaStarHalfAlt, FaRegStar } from "react-icons/fa";

export default function Rating({ value = 0, count, size = "text-sm" }) {
  const stars = [1, 2, 3, 4, 5];

  return (
    <div className={`flex items-center gap-1 ${size}`}>
      <div className="flex text-brass">
        {stars.map((s) => {
          if (value >= s) return <FaStar key={s} />;
          if (value >= s - 0.5) return <FaStarHalfAlt key={s} />;
          return <FaRegStar key={s} />;
        })}
      </div>
      {count !== undefined && <span className="text-ink/50 text-xs">({count})</span>}
    </div>
  );
}
