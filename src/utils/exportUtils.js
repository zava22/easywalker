export const exportToPDF = async (chat) => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(20);
  doc.text(chat.title, 20, 30);
  
  // Date
  doc.setFontSize(12);
  doc.text(`Created: ${new Date(chat.createdAt).toLocaleDateString()}`, 20, 45);
  
  let yPosition = 60;
  
  chat.messages.forEach((message, index) => {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
    }
    
    // Role
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(message.role === 'user' ? 'You:' : 'AI:', 20, yPosition);
    
    // Content
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    const content = message.content.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ');
    const lines = doc.splitTextToSize(content, 170);
    
    yPosition += 10;
    lines.forEach(line => {
      if (yPosition > 280) {
        doc.addPage();
        yPosition = 30;
      }
      doc.text(line, 20, yPosition);
      yPosition += 6;
    });
    
    yPosition += 10;
  });
  
  doc.save(`${chat.title}.pdf`);
};

export const exportToMarkdown = (chat) => {
  let markdown = `# ${chat.title}\n\n`;
  markdown += `*Created: ${new Date(chat.createdAt).toLocaleDateString()}*\n\n`;
  
  chat.messages.forEach(message => {
    const role = message.role === 'user' ? '**You**' : '**AI**';
    const content = message.content.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
    markdown += `${role}: ${content}\n\n---\n\n`;
  });
  
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${chat.title}.md`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportToTXT = (chat) => {
  let text = `${chat.title}\n`;
  text += `Created: ${new Date(chat.createdAt).toLocaleDateString()}\n\n`;
  
  chat.messages.forEach(message => {
    const role = message.role === 'user' ? 'You' : 'AI';
    const content = message.content.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
    text += `${role}: ${content}\n\n`;
  });
  
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${chat.title}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};