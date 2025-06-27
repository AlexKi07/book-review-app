function RatingSelector({ value, onChange }) {
  return (
    <select
      className="border p-2 rounded"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
    >
      <option value={0}>Select Rating</option>
      {[1, 2, 3, 4, 5].map((star) => (
        <option key={star} value={star}>
          {star} Star{star > 1 ? "s" : ""}
        </option>
      ))}
    </select>
  );
}

export default RatingSelector;
