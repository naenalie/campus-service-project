# Skill 02 — Elicitation

## Tujuan
Menggali kebutuhan tersembunyi, harapan yang tidak terucapkan, dan batasan
yang mungkin tidak disadari stakeholder sendiri.

## Kapan Digunakan
Setelah inception.md selesai dan divalidasi manusia.
Jalankan TERPISAH untuk tiap stakeholder.

## Input
- docs/requirements/inception.md (sudah direview manusia)
- Peran stakeholder yang ingin digali

## Langkah Kerja
1. Baca pain point stakeholder dari inception.md
2. Buat pertanyaan elicitation yang spesifik untuk peran itu
3. Kelompokkan pertanyaan: Fungsional / Non-Fungsional / Batasan / Prioritas
4. Antisipasi jawaban dan implikasinya ke requirement
5. Tandai mana yang bisa jadi konflik dengan stakeholder lain

## Output
- docs/requirements/elicitation-[nama-stakeholder].md

## Aturan
- Minimal 5 pertanyaan per stakeholder
- Tiap pertanyaan harus punya alasan mengapa ditanyakan
- Jangan membuat asumsi jawaban tanpa menandai [ASUMSI JAWABAN]

## Quality Check
- [ ] Pertanyaan sudah cover kebutuhan fungsional DAN non-fungsional?
- [ ] Ada pertanyaan tentang edge case?
- [ ] Ada pertanyaan tentang prioritas fitur?
- [ ] Potensi konflik antar stakeholder sudah dicatat?

## Kondisi Gagal
Berhenti jika inception.md belum direview manusia.

## Human Review
- Apakah pertanyaan cukup tajam untuk menggali kebutuhan tersembunyi?
- Apakah ada kebutuhan yang mungkin terlewat?
