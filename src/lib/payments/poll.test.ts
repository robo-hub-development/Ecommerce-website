import { describe, expect, it, vi } from "vitest";
import { pollPaymentOutcome } from "@/lib/payments/poll";
import type { Order, PaymentOutcome } from "@/types/order";

const order = { id: "ord_1" } as Order;
const noSleep = () => Promise.resolve();
const outcomes = () => vi.fn<() => Promise<PaymentOutcome>>();

describe("pollPaymentOutcome", () => {
  it("returns as soon as the order exists", async () => {
    const fetchOutcome = outcomes()
      .mockResolvedValueOnce({ status: "pending" })
      .mockResolvedValueOnce({ status: "success", order });
    await expect(pollPaymentOutcome(fetchOutcome, { sleep: noSleep })).resolves.toEqual({ status: "success", order });
    expect(fetchOutcome).toHaveBeenCalledTimes(2);
  });

  it("keeps waiting while success has no order yet", async () => {
    const fetchOutcome = outcomes()
      .mockResolvedValueOnce({ status: "success" })
      .mockResolvedValueOnce({ status: "success", order });
    await expect(pollPaymentOutcome(fetchOutcome, { sleep: noSleep })).resolves.toMatchObject({ status: "success" });
  });

  it("reports failed only when the backend says so", async () => {
    const fetchOutcome = outcomes().mockResolvedValue({ status: "failed" });
    await expect(pollPaymentOutcome(fetchOutcome, { sleep: noSleep })).resolves.toEqual({ status: "failed" });
  });

  it("times out after 60s of 3s polls and never claims failure", async () => {
    const fetchOutcome = outcomes().mockResolvedValue({ status: "pending" });
    const sleep = vi.fn(noSleep);
    await expect(pollPaymentOutcome(fetchOutcome, { sleep })).resolves.toEqual({ status: "timeout" });
    expect(fetchOutcome).toHaveBeenCalledTimes(21); // t = 0, 3, ... 60
    expect(sleep).toHaveBeenCalledWith(3_000);
  });

  it("treats request errors as still pending", async () => {
    const fetchOutcome = outcomes()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValueOnce({ status: "success", order });
    await expect(pollPaymentOutcome(fetchOutcome, { sleep: noSleep })).resolves.toMatchObject({ status: "success" });
  });

  it("stops when aborted", async () => {
    const controller = new AbortController();
    controller.abort();
    const fetchOutcome = outcomes();
    await expect(pollPaymentOutcome(fetchOutcome, { sleep: noSleep, signal: controller.signal })).resolves.toEqual({
      status: "timeout",
    });
    expect(fetchOutcome).not.toHaveBeenCalled();
  });
});
