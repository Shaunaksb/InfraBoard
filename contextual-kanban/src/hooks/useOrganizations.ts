import { Organization } from "@/types/kanban";
import { useLocalStorage } from "./useLocalStorage";
import { useUsers } from "./useUsers";
import { orgsApi } from "@/lib/api";
import { useEffect } from "react";

const INITIAL_ORGS: Organization[] = [
    {
        id: "org_1",
        name: "Engineering",
        ownerId: "user_1",
        memberIds: ["user_1", "user_2"],
    },
];

export function useOrganizations() {
    const [organizations, setOrganizations] = useLocalStorage<Organization[]>("kanban_orgs", INITIAL_ORGS);
    const { currentUserId } = useUsers();

    // Fetch orgs from backend on mount
    useEffect(() => {
        let mounted = true;
        if (currentUserId) {
            orgsApi.getOrgs().then((serverOrgs) => {
                if (mounted && serverOrgs) {
                    setOrganizations(serverOrgs);
                }
            }).catch(console.error);
        }
        return () => { mounted = false; };
    }, [currentUserId]);

    const addOrganization = (name: string, initialMemberIds: string[] = []) => {
        if (!currentUserId) return;
        const newOrg: Organization = {
            id: `org_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
            name,
            ownerId: currentUserId,
            memberIds: [currentUserId, ...initialMemberIds.filter(id => id !== currentUserId)],
        };
        // Optimistic local update
        setOrganizations((prev) => [...prev, newOrg]);

        // Backend sync
        orgsApi.createOrg({ name }).then(serverOrg => {
            // Replace temporary ID with server ID
            setOrganizations(prev => prev.map(o => o.id === newOrg.id ? serverOrg : o));
            if (initialMemberIds.length > 0) {
                orgsApi.addMembers(serverOrg.id, initialMemberIds).catch(console.error);
            }
        }).catch(err => {
            console.error("Failed to create org on backend", err);
        });
    };

    const updateOrganization = (updatedOrg: Organization) => {
        setOrganizations((prev) => prev.map((o) => (o.id === updatedOrg.id ? updatedOrg : o)));
    };

    const deleteOrganization = (id: string) => {
        setOrganizations((prev) => prev.filter((o) => o.id !== id));
    };

    const addMembersToOrg = (orgId: string, memberIdsToAdd: string[]) => {
        // Optimistic local update
        setOrganizations((prev) => prev.map(org => {
            if (org.id === orgId) {
                const newMembers = new Set([...org.memberIds, ...memberIdsToAdd]);
                return { ...org, memberIds: Array.from(newMembers) };
            }
            return org;
        }));

        // Backend sync
        orgsApi.addMembers(orgId, memberIdsToAdd).catch(console.error);
    };

    const removeMemberFromOrg = (orgId: string, memberId: string) => {
        setOrganizations((prev) => prev.map(org => {
            if (org.id === orgId) {
                return { ...org, memberIds: org.memberIds.filter(id => id !== memberId) };
            }
            return org;
        }));
    };

    // Organizations the current user is a part of
    const myOrganizations = organizations.filter(org => currentUserId && org.memberIds.includes(currentUserId));

    return {
        organizations,
        myOrganizations,
        addOrganization,
        updateOrganization,
        deleteOrganization,
        addMembersToOrg,
        removeMemberFromOrg,
    };
}
