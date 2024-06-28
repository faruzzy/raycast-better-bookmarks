import { Action, ActionPanel, Icon, List } from "@raycast/api";
import { useMemo } from "react";
import { BookmarkData } from "../types";

type BookmarkRowProps = {
  bookmark: BookmarkData;
};

export default function BookmarkRow({ bookmark: { name, folderPath, url, fullPath } }: BookmarkRowProps): JSX.Element {
  const accessories = useMemo(
    () => (folderPath.length ? [{ icon: Icon.Folder, text: folderPath.join("/") }] : []),
    [folderPath],
  );

  const favicon = useMemo(() => `https://api.faviconkit.com/${new URL(url).host}`, [url]);

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
