import React from "react";
import OriginalSiteRedesign from "./OriginalSiteRedesign";

interface WebLandingViewProps {
  onOpenTelegramPreview?: () => void;
  onOpenRepoModal?: () => void;
  onOpenCrm?: () => void;
}

export const WebLandingView: React.FC<WebLandingViewProps> = () => {
  return <OriginalSiteRedesign />;
};

export default WebLandingView;
