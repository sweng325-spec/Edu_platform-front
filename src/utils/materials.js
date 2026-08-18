export function groupMaterialsByFolder(materials = []) {
  const foldersMap = {};
  
  materials.forEach((item) => {
    const folderId = item.folder_id || item.folderName || 'general';
    const folderTitle = item.folder_title || item.folderName || 'General Materials';
    
    if (!foldersMap[folderId]) {
      foldersMap[folderId] = {
        id: folderId,
        title: folderTitle,
        items: [],
      };
    }
    foldersMap[folderId].items.push(item);
  });

  return Object.values(foldersMap);
}

export function filterMaterialsByFolder(materials = [], folderId) {
  return materials.filter((item) => String(item.folder_id || item.folderName) === String(folderId));
}

export function countMaterialsByFolder(materials = []) {
  const folders = groupMaterialsByFolder(materials);
  return {
    folderCount: folders.length,
    totalFiles: materials.length,
  };
}