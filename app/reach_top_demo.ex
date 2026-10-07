defmodule HologramSkeleton.ReachTopDemo do
  use Hologram.Component

  prop :direction, :string
  prop :container_id, :string
  prop :counter_id, :string

  def init(_props, component, _server) do
    put_state(component, :count, 0)
  end

  def template do
    ~HOLO"""
    <section>
      <h2>{@direction}</h2>
      <p>Top events: <strong id={@counter_id}>{@count}</strong></p>
      <div
        id={@container_id}
        style={"display: flex; flex-direction: " <> @direction <> "; height: 240px; width: 280px; overflow-y: auto; border: 2px solid #555;"}
        $reach_top.within(0px)="reached_top"
      >
        {%for item <- 1..20}
          <div style="flex: 0 0 48px; box-sizing: border-box; border-bottom: 1px solid #aaa; padding: 12px;">Item {item}</div>
        {/for}
      </div>
    </section>
    """
  end

  def action(:reached_top, _params, component) do
    put_state(component, :count, component.state.count + 1)
  end
end
