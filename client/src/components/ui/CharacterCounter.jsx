const CharacterCounter = ({ current, max }) => {
  const ratio = current / max;
  const isNearLimit = ratio >= 0.9;
  const isAtLimit = current >= max;

  return (
    <span
      className={`text-xs tabular-nums ${
        isAtLimit
          ? "text-red-500 font-medium"
          : isNearLimit
            ? "text-amber-500"
            : "text-muted-foreground"
      }`}
    >
      {current}/{max}
    </span>
  );
};

export default CharacterCounter;
