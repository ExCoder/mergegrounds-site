import type { Metadata } from 'next';
import Link from 'next/link';
import { ContentShell } from '../../content-shell';

export const metadata: Metadata = {
  title: 'AI system assurance — MergeGrounds',
  description:
    'Evidence requirements for reasoning, retrieval, long context, benchmarks, fine-tuning, tools, and runtime change.',
  alternates: { canonical: '/docs/ai-system-assurance' },
};

export default function AiSystemAssurance() {
  return (
    <ContentShell
      eyebrow="DOCS / AI SYSTEM ASSURANCE"
      title="Evaluate the system you ship—not the story the model tells."
      description="Code gates remain necessary when AI is part of the product, but they are not sufficient. Retrieval, context construction, model changes, tools, and runtime behavior need their own versioned evidence."
    >
      <aside className="prose-callout">
        <strong>The rule</strong>
        <p>
          A model explanation, confidence score, vendor leaderboard, or second
          answer from the same session is not admission evidence. Use an
          observable oracle, an exact subject identity, negative controls, and
          an independently produced result.
        </p>
      </aside>

      <h2>1. Judge outcomes, not visible reasoning</h2>
      <p>
        Chain-of-thought can be useful working text, but research has shown that
        it may omit information that affected an answer. Treat a persuasive
        explanation as a review aid, never as proof of correctness. Keep hidden
        reasoning out of evidence envelopes and grade the observable result
        against independently defined acceptance and rejection cases.
      </p>
      <p>
        <a
          href="https://www.anthropic.com/research/reasoning-models-dont-say-think"
          rel="noreferrer"
        >
          Primary source: Anthropic, reasoning models do not always say what
          they think
        </a>
      </p>

      <h2>2. Measure delivery, not generated lines</h2>
      <p>
        A 2025 randomized study of 16 experienced open-source developers across
        246 tasks found that the tested early-2025 AI tools increased completion
        time by 19% in that setting. It does not establish a universal slowdown;
        it does show why perceived speed is not enough. Compare cohorts using
        reviewed-design-to-production lead time, rework, escaped defects,
        corrective churn, recovery time, and total cost.
      </p>
      <p>
        <a
          href="https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/"
          rel="noreferrer"
        >
          Primary source: METR productivity study
        </a>
      </p>

      <h2>3. Test retrieval as a pipeline</h2>
      <p>
        RAG does not make unsupported answers impossible. Evaluate retrieval
        relevance, evidence selection, generation, and citation fidelity
        separately. Include stale documents, plausible distractors, missing
        support, conflicting sources, access-control boundaries, and an explicit
        abstention oracle. Bind evidence to the corpus, index, retriever,
        reranker, prompt, model, and tenant policy.
      </p>
      <p>
        One large medical evaluation used 80,502 expert annotations and found
        that standard RAG could reduce factuality by up to six percentage points
        in its tested conditions when retrieval and evidence selection were
        weak. The operational lesson is stage-aware evaluation—not a claim that
        RAG always hurts.
      </p>
      <p>
        <a href="https://arxiv.org/abs/2511.06738" rel="noreferrer">
          Primary source: large-scale expert evaluation of medical RAG
        </a>
      </p>

      <h2>4. Challenge the advertised context window</h2>
      <p>
        Capacity is not recall. Test low lexical overlap, aliases, multiple
        connected facts, distractors, contradictions, truncation, and facts at
        the beginning, middle, and end. NoLiMa found substantial degradation at
        longer contexts when literal matches were removed, even for models that
        advertised much larger windows.
      </p>
      <p>
        <a
          href="https://proceedings.mlr.press/v267/modarressi25a.html"
          rel="noreferrer"
        >
          Primary source: NoLiMa, ICML 2025
        </a>
      </p>

      <h2>5. Assume public benchmarks can lie</h2>
      <p>
        A leaderboard is discovery input, not a release gate. Record every case,
        skipped or failed setup, prompt and tool configuration, scorer version,
        contamination check, and critical slice. Prefer product-specific,
        executable, protected or time-split holdouts. In 2026, OpenAI stopped
        reporting SWE-bench Verified after finding flawed tests and evidence of
        benchmark exposure in frontier models.
      </p>
      <p>
        <a
          href="https://openai.com/index/why-we-no-longer-evaluate-swe-bench-verified/"
          rel="noreferrer"
        >
          Primary source: OpenAI’s SWE-bench Verified audit
        </a>
      </p>

      <h2>6. Regression-test every model adaptation</h2>
      <p>
        Fine-tuning can improve the optimized behavior while degrading retained
        capabilities or safety. Compare the candidate to the exact base and
        production model on target performance, general capability, security,
        privacy, authorization, prompt injection, cost, and incident
        regressions. Pin the model, tokenizer, dataset, recipe, and runtime;
        then rehearse rollback.
      </p>
      <ul>
        <li>
          <a href="https://doi.org/10.1038/s41586-025-09937-5" rel="noreferrer">
            Primary source: narrow insecure-code fine-tuning and broad
            misalignment
          </a>
        </li>
        <li>
          <a
            href="https://www.microsoft.com/en-us/research/publication/lora-vs-full-fine-tuning-an-illusion-of-equivalence/"
            rel="noreferrer"
          >
            Primary source: Microsoft Research on LoRA, full fine-tuning, and
            forgetting
          </a>
        </li>
      </ul>

      <h2>7. Keep tools and data inside explicit authority</h2>
      <p>
        Model intent is irrelevant to enforcement. Deny ambient credentials and
        egress, broker each tool capability, validate arguments and outputs,
        isolate untrusted execution, and make retained conversation state and
        provider data use part of the threat model. A friendly prompt is not a
        privacy or authorization control.
      </p>

      <h2>What MergeGrounds materializes</h2>
      <ul>
        <li>
          versioned, product-specific eval manifests and complete case counts;
        </li>
        <li>positive, negative, adversarial, and recovery controls;</li>
        <li>
          exact model, data, retrieval, prompt, tool, and runtime identities;
        </li>
        <li>critical-slice thresholds that aggregates cannot average away;</li>
        <li>
          shadow/canary evidence, drift triggers, rollback, and incident replay;
        </li>
        <li>
          fail-closed handling for stale, partial, skipped, or mismatched
          evidence.
        </li>
      </ul>

      <p>
        These controls extend the repository gate. Read the{' '}
        <Link href="/docs/trust-boundary">trust boundary</Link> before assigning
        any assurance tier.
      </p>
    </ContentShell>
  );
}
