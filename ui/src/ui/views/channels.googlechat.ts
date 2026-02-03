import { html, nothing } from "lit";
import type { GoogleChatStatus } from "../types.ts";
import type { ChannelsProps } from "./channels.types.ts";
import { formatAgo } from "../format.ts";
import { renderChannelConfigSection } from "./channels.config.ts";

import { t } from "../i18n";
export function renderGoogleChatCard(params: {
  props: ChannelsProps;
  googleChat?: GoogleChatStatus | null;
  accountCountLabel: unknown;
}) {
  const { props, googleChat, accountCountLabel } = params;

  return html`
    <div class="card">
      <div class="card-title">${t().ui.views.channels.googlechat.title}</div>
      <div class="card-sub">Chat API webhook status and channel configuration.</div>
      ${accountCountLabel}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">${t().ui.views.channels.configured}</span>
          <span>${googleChat ? (googleChat.configured ? t().ui.views.channels.yes : t().ui.views.channels.no) : t().ui.views.channels.na}</span>
        </div>
        <div>
          <span class="label">${t().ui.views.channels.running}</span>
          <span>${googleChat ? (googleChat.running ? t().ui.views.channels.yes : t().ui.views.channels.no) : t().ui.views.channels.na}</span>
        </div>
        <div>
          <span class="label">Credential</span>
          <span>${googleChat?.credentialSource ?? t().ui.views.channels.na}</span>
        </div>
        <div>
          <span class="label">Audience</span>
          <span>
            ${
              googleChat?.audienceType
                ? `${googleChat.audienceType}${googleChat.audience ? ` · ${googleChat.audience}` : ""}`
                : t().ui.views.channels.na
            }
          </span>
        </div>
        <div>
          <span class="label">Last start</span>
          <span>${googleChat?.lastStartAt ? formatAgo(googleChat.lastStartAt) : t().ui.views.channels.na}</span>
        </div>
        <div>
          <span class="label">Last probe</span>
          <span>${googleChat?.lastProbeAt ? formatAgo(googleChat.lastProbeAt) : t().ui.views.channels.na}</span>
        </div>
      </div>

      ${
        googleChat?.lastError
          ? html`<div class="callout danger" style="margin-top: 12px;">
            ${googleChat.lastError}
          </div>`
          : nothing
      }

      ${
        googleChat?.probe
          ? html`<div class="callout" style="margin-top: 12px;">
            Probe ${googleChat.probe.ok ? "ok" : "failed"} ·
            ${googleChat.probe.status ?? ""} ${googleChat.probe.error ?? ""}
          </div>`
          : nothing
      }

      ${renderChannelConfigSection({ channelId: "googlechat", props })}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${() => props.onRefresh(true)}>
          Probe
        </button>
      </div>
    </div>
  `;
}
