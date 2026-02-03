import { html, nothing } from "lit";
import type { IMessageStatus } from "../types";
import type { ChannelsProps } from "./channels.types";
import { formatAgo } from "../format";
import { renderChannelConfigSection } from "./channels.config";

import { t } from "../i18n";
export function renderIMessageCard(params: {
  props: ChannelsProps;
  imessage?: IMessageStatus | null;
  accountCountLabel: unknown;
}) {
  const { props, imessage, accountCountLabel } = params;

  return html`
    <div class="card">
      <div class="card-title">${t().ui.views.channels.imessage.title}</div>
      <div class="card-sub">macOS bridge status and channel configuration.</div>
      ${accountCountLabel}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">${t().ui.views.channels.configured}</span>
          <span>${imessage?.configured ? t().ui.views.channels.yes : t().ui.views.channels.no}</span>
        </div>
        <div>
          <span class="label">${t().ui.views.channels.running}</span>
          <span>${imessage?.running ? t().ui.views.channels.yes : t().ui.views.channels.no}</span>
        </div>
        <div>
          <span class="label">Last start</span>
          <span>${imessage?.lastStartAt ? formatAgo(imessage.lastStartAt) : t().ui.views.channels.na}</span>
        </div>
        <div>
          <span class="label">Last probe</span>
          <span>${imessage?.lastProbeAt ? formatAgo(imessage.lastProbeAt) : t().ui.views.channels.na}</span>
        </div>
      </div>

      ${
        imessage?.lastError
          ? html`<div class="callout danger" style="margin-top: 12px;">
            ${imessage.lastError}
          </div>`
          : nothing
      }

      ${
        imessage?.probe
          ? html`<div class="callout" style="margin-top: 12px;">
            Probe ${imessage.probe.ok ? "ok" : "failed"} ·
            ${imessage.probe.error ?? ""}
          </div>`
          : nothing
      }

      ${renderChannelConfigSection({ channelId: "imessage", props })}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${() => props.onRefresh(true)}>
          Probe
        </button>
      </div>
    </div>
  `;
}
