import jsPDF from 'jspdf';
import type { SWCharacter } from '@/models/character';

/** Export character as a styled PDF */
export function exportCharacterPDF(character: SWCharacter): void {
  const doc = new jsPDF();
  const margin = 15;
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = margin;

  const lineHeight = 7;
  const sectionGap = 10;

  function checkPage() {
    if (y > 270) {
      doc.addPage();
      y = margin;
    }
  }

  // ── Title ──
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Savage Worlds — Character Sheet', margin, y);
  y += 12;

  doc.setDrawColor(180, 145, 46);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += sectionGap;

  // ── Basic Info ──
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Character Info', margin, y);
  y += lineHeight;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(`Name: ${character.name || '—'}`, margin, y);
  y += lineHeight;
  doc.text(`Concept: ${character.concept || '—'}`, margin, y);
  y += lineHeight;
  doc.text(`Race: ${character.race}`, margin, y);
  y += lineHeight;
  doc.text(`Rank: ${character.rank}`, margin, y);
  y += sectionGap;

  // ── Attributes ──
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Attributes', margin, y);
  y += lineHeight;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);

  const attrEntries = Object.entries(character.attributes);
  const attrText = attrEntries.map(([k, v]) => `${k}: ${v}`).join('   |   ');
  doc.text(attrText, margin, y);
  y += sectionGap;

  // ── Derived Stats ──
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Derived Statistics', margin, y);
  y += lineHeight;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(
    `Pace: ${character.derivedStats.pace}   |   Parry: ${character.derivedStats.parry}   |   Toughness: ${character.derivedStats.toughness}`,
    margin,
    y,
  );
  y += sectionGap;

  // ── Skills ──
  checkPage();
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Skills', margin, y);
  y += lineHeight;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);

  const sortedSkills = [...character.skills].sort((a, b) => a.name.localeCompare(b.name));
  const midIdx = Math.ceil(sortedSkills.length / 2);
  const col1 = sortedSkills.slice(0, midIdx);
  const col2 = sortedSkills.slice(midIdx);
  const skillStartY = y;

  col1.forEach((skill) => {
    checkPage();
    const prefix = skill.isCore ? '● ' : '  ';
    doc.text(`${prefix}${skill.name} (${skill.linkedAttribute}): ${skill.die}`, margin, y);
    y += 6;
  });

  y = skillStartY;
  col2.forEach((skill) => {
    checkPage();
    const prefix = skill.isCore ? '● ' : '  ';
    doc.text(`${prefix}${skill.name} (${skill.linkedAttribute}): ${skill.die}`, pageWidth / 2, y);
    y += 6;
  });

  y = Math.max(y, skillStartY + col1.length * 6) + 4;

  // ── Edges ──
  if (character.edges.length > 0) {
    checkPage();
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Edges', margin, y);
    y += lineHeight;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    character.edges.forEach((edge) => {
      checkPage();
      doc.text(`• ${edge.name} — ${edge.description}`, margin, y);
      y += 6;
    });
    y += 4;
  }

  // ── Hindrances ──
  if (character.hindrances.length > 0) {
    checkPage();
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Hindrances', margin, y);
    y += lineHeight;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    character.hindrances.forEach((h) => {
      checkPage();
      doc.text(`• ${h.name} (${h.severity}) — ${h.effect}`, margin, y, {
        maxWidth: pageWidth - margin * 2,
      });
      y += 6;
    });
    y += 4;
  }

  // ── Notes ──
  if (character.notes) {
    checkPage();
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Notes', margin, y);
    y += lineHeight;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(character.notes, pageWidth - margin * 2);
    doc.text(lines, margin, y);
  }

  // ── Embed JSON in PDF metadata for round-trip import ──
  doc.setProperties({
    title: `SWADE Character - ${character.name}`,
    subject: JSON.stringify(character),
  });

  doc.save(`${character.name || 'character'}-swade.pdf`);
}
