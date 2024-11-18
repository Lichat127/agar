import React from "react";

const Food = React.memo(({ x, y, r, color }) => (
  <circle cx={x} cy={y} r={r} fill={color} />
));

export default Food;
