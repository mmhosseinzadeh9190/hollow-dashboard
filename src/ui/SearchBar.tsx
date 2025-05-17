import { CloseSquare, Code, Eye, SearchNormal1 } from "iconsax-react";
import React, { ReactNode, useState } from "react";
import Button from "./Button";
import Modal from "./Modal";
import toast from "react-hot-toast";
import { Project } from "../services/apiProjects";
import { Team } from "../services/apiTeams";
import { User } from "../services/apiUsers";
import { useNavigate } from "react-router-dom";
import PreMadeButtons from "./PreMadeButtons";

type SearchBarProps = {
  projects: Project[];
  teams: Team[];
  user: User;
};

function SearchBar({ projects, teams, user }: SearchBarProps) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState<ReactNode>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const userTeamIds =
    teams
      .filter((team) => team.members?.includes(String(user?.id)))
      .map((team) => team.id) || [];

  const userProjects =
    projects.filter((project) => userTeamIds?.includes(project.team!)) || [];

  const handleOpenModal = (content: ReactNode) => {
    setModalContent(content);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
  };

  const findProjects = (searchTerm: string) => {
    const lowerSearchTerm = searchTerm.toLowerCase();

    const matchedProjects = userProjects.filter((project) => {
      const nameMatch = project.name?.toLowerCase().includes(lowerSearchTerm);
      const tagsMatch = project.tags?.some((tag) =>
        tag.toLowerCase().includes(lowerSearchTerm),
      );
      return nameMatch || tagsMatch;
    });

    if (matchedProjects.length > 0) {
      handleOpenModal(
        <div className="flex max-h-xl w-xl flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="font-roboto text-xl font-medium tracking-0.1 text-gray-900">
              Projects
            </h2>
            <Button
              onClick={handleCloseModal}
              className="text-gray-600 hover:text-gray-700"
            >
              <CloseSquare size="20" />
            </Button>
          </div>
          <div className="-mr-8 flex flex-col overflow-y-scroll pr-7">
            {matchedProjects.map((project) => (
              <div
                key={project.id}
                className="border-b-2 border-dashed border-gray-200 py-4 first-of-type:pt-0 last-of-type:border-b-0 last-of-type:pb-0.5"
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="flex flex-1 items-center gap-1">
                    <Code size="20" className="text-gray-600" />
                    <span className="mt-px max-w-96 truncate font-roboto font-medium capitalize tracking-0.1 text-gray-900">
                      {project.name}
                    </span>
                  </h3>

                  <PreMadeButtons
                    type="edit"
                    text="See details"
                    icon={<Eye size="16" />}
                    onClick={() => {
                      handleCloseModal();
                      navigate(`/projects/${project.id}`);
                    }}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>,
      );
    } else {
      toast.error("No projects found. Please try again.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim())
      return toast.error("Please enter something to search!");

    setIsSubmitting(true);
    findProjects(searchTerm);
    setSearchTerm("");
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mr-auto w-72">
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      <div className="relative">
        <Button type="submit" className="absolute left-3 top-3">
          <SearchNormal1 size="16" className="text-gray-600" />
        </Button>

        <input
          type="text"
          id="search"
          value={searchTerm}
          onChange={handleChange}
          placeholder="Search..."
          className="block w-full rounded-full border border-gray-200 bg-gray-100 py-2.5 pl-9 pr-4 font-roboto text-sm tracking-0.1 text-gray-800 placeholder:text-gray-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-gray-200"
        />
      </div>
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        {modalContent}
      </Modal>
    </form>
  );
}

export default SearchBar;
