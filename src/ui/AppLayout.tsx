import { useEffect, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import Main from "./Main";
import { useUsers } from "../features/dashboard/useUsers";
import { useUser } from "../features/authentication/useUser";
import Spinner from "./Spinner";
import { User } from "../services/apiUsers";
import { insertUser } from "../services/apiAuth";
import { useActivity } from "../features/activity/useActivity";
import { useProjects } from "../features/projects/useProjects";
import { useTeams } from "../features/dashboard/useTeams";

function AppLayout() {
  const {
    users,
    isLoading: usersIsLoading,
    error: usersError,
    refetch: usersRefetch,
  } = useUsers();

  const {
    activities,
    isLoading: activitiesIsLoading,
    error: activitiesError,
    refetch: activitiesRefetch,
  } = useActivity();

  const {
    projects,
    isLoading: projectsIsLoading,
    error: projectsError,
    refetch: projectsRefetch,
  } = useProjects();

  const { teams, isLoading: teamsIsLoading, error: teamsError } = useTeams();

  const { user: supabaseUser, isLoading: userIsLoading } = useUser();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInsertingUser, setIsInsertingUser] = useState(false);

  useEffect(() => {
    const handleUserSync = async () => {
      if (!supabaseUser || usersIsLoading || userIsLoading) return;

      const foundUser = users?.data?.find(
        (user) => String(user.id) === supabaseUser.id,
      );

      if (foundUser) {
        setCurrentUser(foundUser);
        return;
      }

      if (!isInsertingUser) {
        const providers = ["facebook", "twitter", "github"];
        const condition = providers.includes(
          supabaseUser.app_metadata.provider!,
        );

        if (condition) {
          try {
            setIsInsertingUser(true);
            const insertedUser = await insertUser(supabaseUser);
            if (insertedUser && insertedUser[0]) {
              setCurrentUser(insertedUser[0]);
              usersRefetch();
            }
          } catch (error) {
            console.error(error);
            return;
          } finally {
            setIsInsertingUser(false);
          }
        }
      }
    };

    handleUserSync();
  }, [
    supabaseUser,
    users?.data,
    usersIsLoading,
    userIsLoading,
    isInsertingUser,
    usersRefetch,
  ]);

  if (
    usersIsLoading ||
    activitiesIsLoading ||
    projectsIsLoading ||
    teamsIsLoading ||
    userIsLoading ||
    isInsertingUser
  ) {
    return (
      <div className="h-dvh w-dvw">
        <Spinner />
      </div>
    );
  }

  return (
    currentUser && (
      <div className="grid h-dvh grid-cols-[max-content_1fr] grid-rows-[auto_1fr]">
        <Header
          user={currentUser}
          activities={activities?.data!}
          projects={projects?.data!}
          teams={teams?.data!}
          onActivitiesUpdated={activitiesRefetch}
          onProjectsUpdated={projectsRefetch}
        />
        <Sidebar />
        <Main />
      </div>
    )
  );
}

export default AppLayout;
