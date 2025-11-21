export const exportCanvasAsImage = async (stageRef) => {
  if (!stageRef?.current) return;

  try {
    // Get the data URL from Konva stage
    const dataURL = stageRef.current.toDataURL({ pixelRatio: 2 });

    // Create a link element and trigger download
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `diseño-espacios-${new Date().getTime()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting canvas:', error);
    alert('Error al exportar la imagen. Por favor intenta de nuevo.');
  }
};
