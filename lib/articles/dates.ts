const arabicMedium = new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium" });
const arabicLong = new Intl.DateTimeFormat("ar-SA", { dateStyle: "long" });
const englishLong = new Intl.DateTimeFormat("en", { dateStyle: "long" });
const landingDate = new Intl.DateTimeFormat("ar-SA", {
  dateStyle: "medium",
  timeZone: "Asia/Riyadh",
});

export function landingPublicationDate(value: string) {
  return landingDate.format(new Date(value));
}

export function publicationDate(
  value: string,
  style: "medium" | "long" = "medium",
  direction: "rtl" | "ltr" = "rtl",
) {
  const formatter = style === "medium"
    ? arabicMedium
    : direction === "rtl" ? arabicLong : englishLong;
  return formatter.format(new Date(value));
}
