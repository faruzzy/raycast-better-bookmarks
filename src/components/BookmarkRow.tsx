import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useMemo } from "react";
import { BookmarkData } from "../types";
import { getFavicon } from "@raycast/utils";

type BookmarkRowProps = {
  bookmark: BookmarkData;
};

export default function BookmarkRow({ bookmark: { name, folderPath, url, fullPath } }: BookmarkRowProps): JSX.Element {
  const accessories = useMemo(
    () => (folderPath.length ? [{ icon: Icon.Folder, text: folderPath.join("/") }] : []),
    [folderPath],
  );

  const favicon = getFavicon(new URL(url).origin, { fallback: Icon.Bookmark });

  return (
    <List.Item
      icon={favicon}
      title={name}
      subtitle={url}
      keywords={fullPath}
      accessories={accessories}
      actions={
        <ActionPanel>
          <Action.OpenInBrowser url={url} />
        </ActionPanel>
      }
    />
  );
}
