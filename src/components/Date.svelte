<script>
export let date;
const parsed = new Date(date);
const localized = parsed.toLocaleString("en", {
  timeStyle: "long",
  dateStyle: "full"
});
</script>
<time date={date} title={date}>{localized}</time>