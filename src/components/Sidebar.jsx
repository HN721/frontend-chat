import {
  Box,
  VStack,
  Text,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useToast,
  Flex,
  Icon,
  Badge,
  Tooltip,
} from "@chakra-ui/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { FiLogOut, FiPlus, FiUsers } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = ({ setSelectedGroup }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDescription, setNewGroupDescription] = useState("");
  const [groups, setGroups] = useState([]);
  const [userGroups, setUserGroups] = useState([]);
  const toast = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  //check if login user is an admin
  useEffect(() => {
    checkAdmin();
    fetchGroups();
  }, []);
  const checkAdmin = () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    setIsAdmin(userInfo?.user?.isAdmin);
  };
  console.log(isAdmin);
  // Sample groups data

  const fetchGroups = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    try {
      const res = await axios.get(
        "https://backend-chat-rose.vercel.app/api/group/get-all",
        {
          headers: {
            Authorization: `Bearer ${userInfo?.user?.token}`,
          },
        }
      );
      setGroups(res.data.groups);
      // get user groups
      const userGroupId = res.data.groups
        .filter((group) => {
          return group.members.some(
            (member) => member._id === userInfo?.user?._id
          );
        })
        .map((group) => group._id);
      console.log(userGroupId);
      setUserGroups(userGroupId);
    } catch (error) {
      console.log(error);
    }
  };
  const handleCreateGroup = async () => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    try {
      const res = await axios.post(
        "https://backend-chat-rose.vercel.app/api/group/create",
        {
          headers: {
            Authorization: `Bearer ${userInfo?.user?.token}`,
          },
        },
        {
          name: newGroupName,
          description: newGroupDescription,
        }
      );
      toast({
        title: "Group created successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
      fetchGroups();
      setNewGroupName("");
      setNewGroupDescription("");
    } catch (error) {
      toast({
        title: "Error",
        description: error.response.data.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  const handleJoinGroup = async (groupId) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    try {
      const res = await axios.post(
        `https://backend-chat-rose.vercel.app/api/group/${groupId}/join`,
        {},
        {
          headers: {
            Authorization: `Bearer ${userInfo?.user?.token}`,
          },
        }
      );

      await fetchGroups();
      setSelectedGroup(groups.find((group) => group._id === groupId));
      toast({
        title: "Group joined successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response.data.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  const handleLeaveGroup = async (groupId) => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    try {
      const res = await axios.post(
        `https://backend-chat-rose.vercel.app/api/group/${groupId}/leave`,
        {},
        {
          headers: {
            Authorization: `Bearer ${userInfo?.user?.token}`,
          },
        }
      );

      await fetchGroups();
      setSelectedGroup(null);
      toast({
        title: "Leave Group successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.response.data.message,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };
  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  console.log(groups);

  return (
    <Box
      h="100%"
      bg="white"
      borderRight="1px"
      borderColor="gray.200"
      width="300px"
      display="flex"
      flexDirection="column"
    >
      <Flex
        p={4}
        borderBottom="1px solid"
        borderColor="gray.200"
        bg="white"
        position="sticky"
        top={0}
        zIndex={1}
        backdropFilter="blur(8px)"
        align="center"
        justify="space-between"
      >
        <Flex align="center">
          <Icon as={FiUsers} fontSize="24px" color="blue.500" mr={2} />
          <Text fontSize="xl" fontWeight="bold" color="gray.800">
            Groups
          </Text>
        </Flex>
        {isAdmin && (
          <Tooltip label="Create New Group" placement="right">
            <Button
              size="sm"
              colorScheme="blue"
              variant="ghost"
              onClick={onOpen}
              borderRadius="full"
            >
              <Icon as={FiPlus} fontSize="20px" />
            </Button>
          </Tooltip>
        )}
      </Flex>

      <Box flex="1" overflowY="auto" p={4} mb={16}>
        <VStack spacing={3} align="stretch">
          {groups.map((group) => (
            <Box
              key={group._id}
              p={4}
              cursor="pointer"
              borderRadius="lg"
              bg={userGroups.includes(group._id) ? "blue.50" : "gray.50"}
              borderWidth="1px"
              borderColor={
                userGroups.includes(group._id) ? "blue.200" : "gray.200"
              }
              transition="all 0.2s"
              _hover={{
                transform: "translateY(-2px)",
                shadow: "md",
                borderColor: "blue.300",
              }}
            >
              <Flex justify="space-between" align="center">
                <Box
                  onClick={() =>
                    userGroups.includes(group._id) && setSelectedGroup(group)
                  }
                  flex="1"
                >
                  <Flex align="center" mb={2}>
                    <Text fontWeight="bold" color="gray.800">
                      {group.name}
                    </Text>
                    {userGroups.includes(group._id) && (
                      <Badge ml={2} colorScheme="blue" variant="subtle">
                        Joined
                      </Badge>
                    )}
                  </Flex>
                  <Text fontSize="sm" color="gray.600" noOfLines={2}>
                    {group.description}
                  </Text>
                </Box>
                <Button
                  size="sm"
                  onClick={() => {
                    userGroups.includes(group._id)
                      ? handleLeaveGroup(group._id)
                      : handleJoinGroup(group._id);
                  }}
                  colorScheme={group.isJoined ? "red" : "blue"}
                  variant={group.isJoined ? "ghost" : "solid"}
                  ml={3}
                  _hover={{
                    transform: group.isJoined ? "scale(1.05)" : "none",
                    bg: group.isJoined ? "red.50" : "blue.600",
                  }}
                  transition="all 0.2s"
                >
                  {userGroups.includes(group._id) ? (
                    <Text fontSize="sm" fontWeight="medium">
                      Leave
                    </Text>
                  ) : (
                    "Join"
                  )}
                </Button>
              </Flex>
            </Box>
          ))}
        </VStack>
      </Box>

      <Box
        p={4}
        borderTop="1px solid"
        borderColor="gray.200"
        bg="gray.50"
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        width="100%"
      >
        <Button
          onClick={handleLogout}
          variant="ghost"
          colorScheme="red"
          leftIcon={<Icon as={FiLogOut} />}
          _hover={{
            bg: "red.50",
            transform: "translateY(-2px)",
            shadow: "md",
          }}
          transition="all 0.2s"
        >
          Logout
        </Button>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay backdropFilter="blur(4px)" />
        <ModalContent>
          <ModalHeader>Create New Group</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Group Name</FormLabel>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter group name"
                focusBorderColor="blue.400"
              />
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>Description</FormLabel>
              <Input
                value={newGroupDescription}
                onChange={(e) => setNewGroupDescription(e.target.value)}
                placeholder="Enter group description"
                focusBorderColor="blue.400"
              />
            </FormControl>

            <Button
              colorScheme="blue"
              mr={3}
              mt={4}
              width="full"
              onClick={handleCreateGroup}
            >
              Create Group
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Sidebar;
