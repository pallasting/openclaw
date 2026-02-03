import { html, nothing } from "lit";
import type { DiscordStatus } from "../types";
import type { ChannelsProps } from "./channels.types";
import { formatAgo } from "../format";
import { renderChannelConfigSection } from "./channels.config";

import { t } from "../i18n";
export function renderDiscordCard(params: {
  props: ChannelsProps;
  discord?: DiscordStatus | null;
  accountCountLabel: unknown;
}) {
  const { props, discord, accountCountLabel } = params;

  return html`
    <div class="card">
      <div class="card-title">${t().ui.views.channels.discord.title}</div>
      <div class="card-sub">${t().ui.views.channels.discord.subtitle}</div>
      ${accountCountLabel}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">${t().ui.views.channels.configured}</span>
          <span>${discord?.configured ? t().ui.views.channels.yes : t().ui.views.channels.no}</span>
        </div>
        <div>
          <span class="label">${t().ui.views.channels.running}</span>
          <span>${discord?.running ? t().ui.views.channels.yes : t().ui.views.channels.no}</span>
        </div>
        <div>
          <span class="label">Last start</span>
          <span>${discord?.lastStartAt ? formatAgo(discord.lastStartAt) : t().ui.views.channels.na}</span>
        </div>
        <div>
          <span class="label">Last probe</span>
          <span>${discord?.lastProbeAt ? formatAgo(discord.lastProbeAt) : t().ui.views.channels.na}</span>
        </div>
      </div>

      ${
        discord?.lastError
          ? html`<div class="callout danger" style="margin-top: 12px;">
            ${discord.lastError}
          </div>`
          : nothing
      }

      ${
        discord?.probe
          ? html`<div class="callout" style="margin-top: 12px;">
            Probe ${discord.probe.ok ? "ok" : "failed"} ·
            ${discord.probe.status ?? ""} ${discord.probe.error ?? ""}
          </div>`
          : nothing
      }

      ${renderChannelConfigSection({ channelId: "discord", props })}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${() => props.onRefresh(true)}>
          Probe
        </button>
      </div>
    </div>
  `;
}
