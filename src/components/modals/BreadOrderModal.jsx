// In the form, add status dropdown
<div>
  <label className="label">Status</label>
  <select
    name="status"
    value={formData.status}
    onChange={handleChange}
    className="input-field"
  >
    <option value="pending">Pending (Reserved)</option>
    <option value="delivered">Delivered</option>
    <option value="completed">Paid</option>
  </select>
</div>
