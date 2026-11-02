"use client";

import { useState } from "react";
import { Link2, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { whatsappShareUrl } from "@/lib/share";

interface ShareButtonProps {
  title: string;
  url: string;
}

/** Uses the native share sheet when available (mostly mobile); otherwise opens a copy link / WhatsApp menu. */
export function ShareButton({ title, url }: ShareButtonProps) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (next: boolean) => {
    if (next && typeof navigator.share === "function") {
      navigator.share({ title, url }).catch(() => {
        // Dismissed by the user: nothing to do.
      });
      return;
    }
    setOpen(next);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn't copy the link. Copy it from the address bar instead.");
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger render={<Button variant="ghost" />}>
        <Share2 aria-hidden data-icon="inline-start" />
        Share
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={copyLink}>
          <Link2 aria-hidden />
          Copy link
        </DropdownMenuItem>
        <DropdownMenuItem
          render={<a href={whatsappShareUrl(title, url)} target="_blank" rel="noopener noreferrer" />}
        >
          <MessageCircle aria-hidden />
          Share on WhatsApp
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
