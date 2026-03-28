export const countryColors: Record<string, string> = {
  "South Korea": "#0047A0",
  "North Korea": "#ED1C27",
  "Japan": "#BC002D",
  "China": "#EE1C25",
  "USA": "#3C3B6E",
  "United States of America": "#3C3B6E",
  "Canada": "#FF0000",
  "Brazil": "#009739",
  "Australia": "#00008B",
  "United Kingdom": "#012169",
  "France": "#002395",
  "Germany": "#FFCE00",
  "Italy": "#008C45",
  "Russia": "#D52B1E",
  "India": "#FF9933",
  "Mexico": "#006847",
  "Spain": "#FFC400",
  "Argentina": "#75AADB",
  "Egypt": "#C09307",
  "South Africa": "#007A4D",
  "Saudi Arabia": "#006C35",
  "Turkey": "#E30A17",
  "Vietnam": "#DA251D",
  "Thailand": "#2D2A4A",
  "Indonesia": "#FF0000",
  "Netherlands": "#F36C21",
  "Sweden": "#006AA7",
  "Norway": "#EF2B2D",
  "Finland": "#003580",
  "Ukraine": "#FFD700",
  "Greece": "#005BAE",
  "Portugal": "#FF0000",
  "Switzerland": "#FF0000",
  "Belgium": "#000000",
  "Austria": "#ED2939",
  "Poland": "#DC143C",
  "Ireland": "#169B62",
  "New Zealand": "#00247D",
  "Chile": "#0039A6",
  "Colombia": "#FCD116",
  "Peru": "#D91023",
  "Nigeria": "#008751",
  "Kenya": "#BB0000",
  "Morocco": "#C1272D",
  "Iran": "#239F40",
  "Pakistan": "#01411C",
  "Philippines": "#0038A8",
};

export const getCountryColor = (name: string) => {
  if (countryColors[name]) return countryColors[name];

  const colors = ["#4A90E2", "#50E3C2", "#B8E986", "#F5A623", "#D0021B", "#BD10E0", "#9013FE"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
