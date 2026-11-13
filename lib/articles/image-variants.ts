// The Node deployment keeps its existing on-demand image processing.
export const prebuiltArticleImagesOnly = false;
export const prebuiltArticleImage: (id: string, file: string, width: number) => Promise<Response | null> = async () => null;
