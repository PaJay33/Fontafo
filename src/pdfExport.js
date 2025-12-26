// src/pdfExport.js - VERSION CORRIGÉE

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Fonction pour générer le rapport PDF mensuel
export const generateMonthlyReport = (monthData, allCotisations, members) => {
  const doc = new jsPDF();
  
  const primaryColor = [59, 130, 246];
  const successColor = [34, 197, 94];
  const dangerColor = [239, 68, 68];
  
  // En-tête
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text('AFO - All For One', 105, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text('Association pour l\'éducation des enfants défavorisés', 105, 25, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Rapport généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 33, { align: 'center' });
  
  const monthName = new Date(monthData.mois + '-01').toLocaleDateString('fr-FR', { 
    month: 'long', 
    year: 'numeric' 
  });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text(`Rapport Mensuel - ${monthName}`, 105, 55, { align: 'center' });
  
  let yPos = 70;
  
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Résumé des Cotisations', 14, yPos);
  
  yPos += 10;
  
  const drawStatCard = (x, y, title, value, color) => {
    doc.setFillColor(...color);
    doc.roundedRect(x, y, 60, 25, 3, 3, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(title, x + 30, y + 8, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(value.toString(), x + 30, y + 18, { align: 'center' });
  };
  
  drawStatCard(14, yPos, 'Total Cotisations', monthData.total, primaryColor);
  drawStatCard(80, yPos, 'Payées', monthData.payes, successColor);
  drawStatCard(146, yPos, 'En Attente', monthData.enAttente, dangerColor);
  
  yPos += 35;
  
  doc.setFillColor(245, 245, 245);
  doc.rect(14, yPos, 182, 25, 'F');
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont(undefined, 'bold');
  doc.text('Montants (Fcfa):', 20, yPos + 8);
  
  doc.setFont(undefined, 'normal');
  doc.setTextColor(...successColor);
  doc.text(`Payé: ${monthData.montantPaye.toLocaleString()} Fcfa`, 20, yPos + 16);
  
  doc.setTextColor(...dangerColor);
  doc.text(`Attendu: ${monthData.montantAttendu.toLocaleString()} Fcfa`, 100, yPos + 16);
  
  yPos += 35;
  
  const successRate = Math.round((monthData.payes / monthData.total) * 100);
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text(`Taux de paiement: ${successRate}%`, 14, yPos);
  
  yPos += 5;
  doc.setFillColor(220, 220, 220);
  doc.rect(14, yPos, 182, 8, 'F');
  
  doc.setFillColor(...successColor);
  doc.rect(14, yPos, (182 * successRate) / 100, 8, 'F');
  
  yPos += 18;
  
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Détails des Cotisations', 14, yPos);
  
  yPos += 5;
  
  const monthCotisations = allCotisations.filter(c => c.mois === monthData.mois);
  
  const tableData = monthCotisations.map(cotisation => {
    const member = members.find(m => m._id === cotisation.userId?._id || m._id === cotisation.userId);
    const memberName = member ? `${member.prenom} ${member.nom}` : 'Inconnu';
    
    return [
      memberName,
      cotisation.montant.toLocaleString() + ' Fcfa',
      cotisation.statut === 'payé' ? 'Payé' : 'En attente',
      cotisation.datePaiement 
        ? new Date(cotisation.datePaiement).toLocaleDateString('fr-FR')
        : '-',
      cotisation.methodePaiement || '-'
    ];
  });
  
  autoTable(doc, {
    startY: yPos,
    head: [['Membre', 'Montant', 'Statut', 'Date Paiement', 'Méthode']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 35, halign: 'right' },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 35, halign: 'center' },
      4: { cellWidth: 30, halign: 'center' }
    },
    didParseCell: function(data) {
      if (data.column.index === 2 && data.section === 'body') {
        if (data.cell.raw === 'Payé') {
          data.cell.styles.textColor = successColor;
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = dangerColor;
          data.cell.styles.fontStyle = 'bold';
        }
      }
    },
    margin: { top: 10 }
  });
  
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} sur ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text(
      'AFO - All For One © 2025',
      14,
      doc.internal.pageSize.height - 10
    );
  }
  
  const fileName = `Rapport_${monthName.replace(/\s/g, '_')}_${Date.now()}.pdf`;
  doc.save(fileName);
};

// Fonction pour générer le rapport global
export const generateGlobalReport = (monthlyStats, allCotisations, members, statsGlobal) => {
  const doc = new jsPDF();
  
  const primaryColor = [59, 130, 246];
  const successColor = [34, 197, 94];
  const dangerColor = [239, 68, 68];
  const warningColor = [251, 146, 60];
  
  // En-tête
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 0, 210, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text('AFO - All For One', 105, 15, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text('Association pour l\'éducation des enfants défavorisés', 105, 25, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Rapport généré le ${new Date().toLocaleDateString('fr-FR')}`, 105, 33, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('Rapport Global des Cotisations', 105, 55, { align: 'center' });
  
  let yPos = 70;
  
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Statistiques Globales', 14, yPos);
  
  yPos += 10;
  
  const drawStatCard = (x, y, title, value, color) => {
    doc.setFillColor(...color);
    doc.roundedRect(x, y, 45, 22, 3, 3, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text(title, x + 22.5, y + 7, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    const valueStr = typeof value === 'number' && value > 1000 
      ? (value / 1000).toFixed(0) + 'k' 
      : value.toString();
    doc.text(valueStr, x + 22.5, y + 16, { align: 'center' });
  };
  
  drawStatCard(14, yPos, 'Total', statsGlobal.totalCotisations, primaryColor);
  drawStatCard(62, yPos, 'Payées', statsGlobal.totalPaye, successColor);
  drawStatCard(110, yPos, 'En Attente', statsGlobal.totalEnAttente, dangerColor);
  drawStatCard(158, yPos, 'Montant', Math.round(statsGlobal.montantTotal / 1000) + 'k', warningColor);
  
  yPos += 35;
  
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Récapitulatif Mensuel', 14, yPos);
  
  yPos += 5;
  
  const monthTableData = monthlyStats.map(stat => {
    const monthName = new Date(stat.mois + '-01').toLocaleDateString('fr-FR', { 
      month: 'short', 
      year: 'numeric' 
    });
    const rate = Math.round((stat.payes / stat.total) * 100);
    
    return [
      monthName,
      stat.total.toString(),
      stat.payes.toString(),
      stat.enAttente.toString(),
      stat.montantPaye.toLocaleString() + ' Fcfa',
      rate + '%'
    ];
  });
  
  autoTable(doc, {
    startY: yPos,
    head: [['Mois', 'Total', 'Payées', 'En Attente', 'Montant Payé', 'Taux']],
    body: monthTableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      fontSize: 9,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 8,
      halign: 'center'
    },
    columnStyles: {
      4: { halign: 'right' },
      5: { fontStyle: 'bold' }
    },
    didParseCell: function(data) {
      if (data.column.index === 5 && data.section === 'body') {
        const rate = parseInt(data.cell.raw);
        if (rate >= 75) {
          data.cell.styles.textColor = successColor;
        } else if (rate >= 50) {
          data.cell.styles.textColor = warningColor;
        } else {
          data.cell.styles.textColor = dangerColor;
        }
      }
    }
  });
  
  doc.addPage();
  
  yPos = 20;
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('Liste Complète des Cotisations', 14, yPos);
  
  yPos += 10;
  
  const allTableData = allCotisations
    .sort((a, b) => new Date(b.mois) - new Date(a.mois))
    .map(cotisation => {
      const member = members.find(m => m._id === cotisation.userId?._id || m._id === cotisation.userId);
      const memberName = member ? `${member.prenom} ${member.nom}` : 'Inconnu';
      
      // ✅ CORRECTION ICI - Utilisez '2-digit' au lieu de 'yy'
      const monthName = new Date(cotisation.mois + '-01').toLocaleDateString('fr-FR', { 
        month: 'short', 
        year: '2-digit'  // ✅ Corrigé
      });
      
      return [
        monthName,
        memberName,
        cotisation.montant.toLocaleString(),
        cotisation.statut === 'payé' ? 'Payé' : 'En attente',
        cotisation.datePaiement 
          ? new Date(cotisation.datePaiement).toLocaleDateString('fr-FR', {
              day: '2-digit',
              month: '2-digit'
            })
          : '-'
      ];
    });
  
  autoTable(doc, {
    startY: yPos,
    head: [['Mois', 'Membre', 'Montant', 'Statut', 'Date']],
    body: allTableData,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      fontSize: 9,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 8
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 50 },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'center' },
      4: { cellWidth: 25, halign: 'center' }
    },
    didParseCell: function(data) {
      if (data.column.index === 3 && data.section === 'body') {
        if (data.cell.raw === 'Payé') {
          data.cell.styles.textColor = successColor;
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = dangerColor;
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });
  
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} sur ${pageCount}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
    doc.text(
      'AFO - All For One © 2025',
      14,
      doc.internal.pageSize.height - 10
    );
  }
  
  const fileName = `Rapport_Global_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
};