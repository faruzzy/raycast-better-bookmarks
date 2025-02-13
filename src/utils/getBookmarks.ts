import { homedir } from "os";
import { Bookmark, BookmarkData, BookmarkFile, Browser } from "../types";
import { getPreferenceValues } from "@raycast/api";
import { promisify } from "util";
import { readdirSync, readFile, statSync } from "fs";
import path from "path";

const BROWSER_PATHS: Record<Browser, string> = {
  chrome: "Google/Chrome",
  brave: "BraveSoftware/Brave-Browser",
};

const readFileAsync = promisify(readFile);

function getBookmarkData(
  currPath: string[],
  bookmark: Bookmark,
): BookmarkData[] {
  const newPath = [...currPath, bookmark.name];

  if (bookmark.type === "url") {
    return [
      {
        id: bookmark.guid,
        name: bookmark.name,
        folderPath: currPath,
        url: bookmark.url,
        fullPath: newPath,
      },
    ];
  }

  return bookmark.children.flatMap((child) => getBookmarkData(newPath, child));
}

/**
 * Gets all the bookmark files.
 * The default location is found within ~/Library/Application Support/Google/Chrome/Default
 * Additional Chrome profiles are stored in: ~/Library/Application Support/Google/Chrome/Profile <number>
 */
function findChromeDirectories(basePath: string) {
  const foundDirectories = [];

  try {
    const entries = readdirSync(basePath);

    for (const entry of entries) {
      const fullPath = path.join(basePath, entry);
      const stats = statSync(fullPath);

      if (stats.isDirectory()) {
        if (entry === "Default" || entry.startsWith("Profile")) {
          foundDirectories.push(fullPath);
        }
      }
    }
  } catch (err) {
    console.error(`Error reading directory ${basePath}:`, err);
  }
  return foundDirectories;
}

function getBookmarksFilePaths(directories: string[]) {
  const filePaths = directories.reduce<string[]>((accumulator, currentDir) => {
    const bookmarksFilePath = path.join(currentDir, "Bookmarks");

    accumulator.push(bookmarksFilePath);
    return accumulator;
  }, []);
  return filePaths;
}

async function loadBookmarkFile(
  browser: Browser,
): Promise<BookmarkFile | BookmarkFile[]> {
  if (browser === "chrome") {
    const basePath = path.join(
      homedir(),
      "Library",
      "Application Support",
      BROWSER_PATHS[browser],
    );
    const directories = findChromeDirectories(basePath);

    const filePaths = getBookmarksFilePaths(directories);

    const results = await Promise.all(
      filePaths.map(
        async (filePath) =>
          JSON.parse(
            (await readFileAsync(filePath, "utf8")).toString(),
          ) as BookmarkFile,
      ),
    );
    return results;
  } else {
    const bookmarksFilePath = path.join(
      homedir(),
      "Library",
      "Application Support",
      BROWSER_PATHS[browser],
      "Default",
      "Bookmarks",
    );

    return JSON.parse(
      (await readFileAsync(bookmarksFilePath, "utf8")).toString(),
    ) as BookmarkFile;
  }
}

export default async function getBookmarks(): Promise<BookmarkData[]> {
  const { defaultBrowser } = getPreferenceValues<Preferences>();
  const loadResult = await loadBookmarkFile(defaultBrowser);

  // only the Default profile
  if (!Array.isArray(loadResult)) {
    const { roots } = loadResult;
    return Object.values(roots).flatMap(({ children }) => {
      return children.flatMap((bookmark) => getBookmarkData([], bookmark));
    });
  } else {
    const res = loadResult.reduce<BookmarkData[][]>((acc, loadRes) => {
      const { roots } = loadRes;
      const result = Object.values(roots).flatMap(({ children }) => {
        return children.flatMap((bookmark) => getBookmarkData([], bookmark));
      });
      return [...acc, result];
    }, []);
    return res.flat();
  }
}
