function viewDateDetail(dateStr) {
  const record = attendanceRecords[dateStr];
  let text = `Attendance for ${dateStr}\n\n`;

  students.forEach(s => {
    const status = record[s.id] === 'P' ? '✅ PRESENT' : '❌ ABSENT';
    text += `${s.roll} - ${s.name} → ${status}\n`;
  });

  document.getElementById('modal-content').textContent = text;
  document.getElementById('details-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('details-modal').classList.add('hidden');
}