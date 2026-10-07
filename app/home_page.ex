defmodule HologramSkeleton.HomePage do
  use Hologram.Page

  route "/"

  layout HologramSkeleton.DefaultLayout

  def template do
    ~HOLO"""
    <main style="font-family: sans-serif; padding: 24px;">
      <h1>$reach_top with column-reverse</h1>
      <p>Scroll each box to its visual bottom, then back to its visual top. Repeat.</p>
      <p>Expected: the top counter increases each time the visual top is reached.</p>
      <p>Reproduction: the reversed box fires at its initial bottom, then its counter stays unchanged when scrolling to the top.</p>
      <div style="display: flex; gap: 32px; flex-wrap: wrap;">
        <HologramSkeleton.ReachTopDemo cid="normal" direction="column" container_id="normal-scroll" counter_id="normal-count" />
        <HologramSkeleton.ReachTopDemo cid="reversed" direction="column-reverse" container_id="reversed-scroll" counter_id="reversed-count" />
      </div>
    </main>
    """
  end
end
