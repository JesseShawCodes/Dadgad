import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = [
  {
    ignores: [".next/*"],
  },
  ...nextCoreWebVitals,
  {
    files: ["src/app/**/*.{js,jsx,ts,tsx}"],
  },
];

export default eslintConfig;
