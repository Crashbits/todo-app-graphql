import React, { useEffect, useState, Fragment } from "react";
import { useMutation, useSubscription } from "@apollo/react-hooks";
import gql from "graphql-tag";
import OnlineUser from "./OnlineUser";

const OnlineUsersWrapper = () => {
  const [onlineIndicator, setOnlineIndicator] = useState(0);
  let onlineUsersList;
  useEffect(() => {
    updateLastSeen();
    setOnlineIndicator(
      setInterval(() => {
        updateLastSeen();
      }, 30000)
    );
    return () => {
      clearInterval(onlineIndicator);
    };
  }, []);
  const UPDATE_LAST_SEEN = gql`
    mutation updateLastSeen($now: timestamptz!) {
      update_users(where: {}, _set: { last_seen: $now }) {
        affected_rows
      }
    }
  `;
  const [updateLastSeenMutation] = useMutation(UPDATE_LAST_SEEN);
  const updateLastSeen = () => {
    updateLastSeenMutation({
      variables: { now: new Date().toISOString() }
    });
  };
  const { loading, error, data } = useSubscription(
    gql`
      subscription getOnlineUsers {
        online_users(order_by: { user: { name: asc } }) {
          id
          user {
            name
          }
        }
      }
    `
  );

  if (loading) {
    return <span>Loading...</span>;
  }
  if (error) {
    console.error(error);
    return <span>Error!</span>;
  }
  if (data) {
    onlineUsersList = data.online_users.map(u => (
      <OnlineUser key={u.id} user={u.user} />
    ));
  }
  return (
    <div className="onlineUserWrapper">
      <Fragment>
        <div className="sliderHeader">
          Online users - {onlineUsersList.length}
        </div>
        {onlineUsersList}
      </Fragment>
    </div>
  );
};

export default OnlineUsersWrapper;
