import { html, nothing } from "lit";
import type { SlackStatus } from "../types.ts";
import type { ChannelsProps } from "./channels.types.ts";
import { formatAgo } from "../format.ts";
import { renderChannelConfigSection } from "./channels.config.ts";

import { t } from "../i18n";
export function renderSlackCard(params: {
  props: ChannelsProps;
  slack?: SlackStatus | null;
  accountCountLabel: unknown;
}) {
  const { props, slack, accountCountLabel } = params;

  return html`
    <div class="card">
      <div class="card-title">${t().ui.views.channels.slack.title}</div>
      <div class="card-sub">Socket mode status and channel configuration.</div>
      ${accountCountLabel}

      <div class="status-list" style="margin-top: 16px;">
        <div>
          <span class="label">${t().ui.views.channels.configured}</span>
          <span>${slack?.configured ? t().ui.views.channels.yes : t().ui.views.channels.no}</span>
        </div>
        <div>
          <span class="label">${t().ui.views.channels.running}</span>
          <span>${slack?.running ? t().ui.views.channels.yes : t().ui.views.channels.no}</span>
        </div>
        <div>
          <span class="label">Last start</span>
          <span>${slack?.lastStartAt ? formatAgo(slack.lastStartAt) : t().ui.views.channels.na}</span>
        </div>
        <div>
          <span class="label">Last probe</span>
          <span>${slack?.lastProbeAt ? formatAgo(slack.lastProbeAt) : t().ui.views.channels.na}</span>
        </div>
      </div>

      ${
        slack?.lastError
          ? html`<div class="callout danger" style="margin-top: 12px;">
            ${slack.lastError}
          </div>`
          : nothing
      }

      ${
        slack?.probe
          ? html`<div class="callout" style="margin-top: 12px;">
            Probe ${slack.probe.ok ? "ok" : "failed"} ·
            ${slack.probe.status ?? ""} ${slack.probe.error ?? ""}
          </div>`
          : nothing
      }

      ${renderChannelConfigSection({ channelId: "slack", props })}

      <div class="row" style="margin-top: 12px;">
        <button class="btn" @click=${() => props.onRefresh(true)}>
          Probe
        </button>
      </div>
    </div>
  `;
}
