import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useScholarData } from "../../hooks/useScholarData";
import { getScholarsByStatus } from "../../lib/firebase/scholars";
import type { Scholar } from "../../types";
import type { ScholarStatus } from "../../types";

vi.mock("../../lib/firebase/scholars", () => ({
  getScholarsByStatus: vi.fn(),
}));

const mockScholar: Scholar = {
  id: "test-id-1",
  name: "Maria Santos",
  course: "BS Computer Science",
  walletAddress: "addr_test1qpz8ktd4d3eqvv5x7qetjl9k4jxzlk2nz3v5test",
  status: "Approved",
  createdAt: { seconds: 1715000000, nanoseconds: 0 } as any,
  updatedAt: { seconds: 1715000000, nanoseconds: 0 } as any,
};

describe("useScholarData", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts in loading state with empty scholars array", () => {
    (getScholarsByStatus as any).mockReturnValue(new Promise(() => {}));
    const { result } = renderHook(() => useScholarData());
    expect(result.current.loading).toBe(true);
    expect(result.current.scholars).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("populates scholars and clears loading on successful fetch", async () => {
    (getScholarsByStatus as any).mockResolvedValue([mockScholar]);
    const { result } = renderHook(() => useScholarData("Approved"));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.scholars).toEqual([mockScholar]);
    expect(result.current.error).toBeNull();
    expect(getScholarsByStatus).toHaveBeenCalledWith("Approved");
  });

  it("defaults to fetching Approved status when no argument given", async () => {
    (getScholarsByStatus as any).mockResolvedValue([]);
    const { result } = renderHook(() => useScholarData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(getScholarsByStatus).toHaveBeenCalledWith("Approved");
  });

  it("sets error message and clears loading on fetch failure", async () => {
    (getScholarsByStatus as any).mockRejectedValue(new Error("Firestore unavailable"));
    const { result } = renderHook(() => useScholarData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe("Firestore unavailable");
    expect(result.current.scholars).toEqual([]);
  });

  it("re-fetches data when refresh() is called", async () => {
    (getScholarsByStatus as any)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([mockScholar]);

    const { result } = renderHook(() => useScholarData());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.scholars).toEqual([]);

    result.current.refresh();
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.scholars).toEqual([mockScholar]);
    });
    expect(getScholarsByStatus).toHaveBeenCalledTimes(2);
  });

  it("re-fetches when the status prop changes", async () => {
    (getScholarsByStatus as any).mockResolvedValue([]);
    const { rerender } = renderHook(
      ({ status }: { status: ScholarStatus }) => useScholarData(status),
      { initialProps: { status: "Approved" as ScholarStatus } }
    );
    await waitFor(() => expect(getScholarsByStatus).toHaveBeenCalledWith("Approved"));

    rerender({ status: "Pending" });
    await waitFor(() => expect(getScholarsByStatus).toHaveBeenCalledWith("Pending"));
    expect(getScholarsByStatus).toHaveBeenCalledTimes(2);
  });
});
